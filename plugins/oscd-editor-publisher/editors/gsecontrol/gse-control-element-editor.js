import { __decorate } from "tslib";
import { css, html, LitElement } from 'lit';
import { property, query, queryAll, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { OscdCheckbox } from '@omicronenergy/oscd-ui/checkbox/OscdCheckbox.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdSclCheckbox } from '@omicronenergy/oscd-ui/scl-checkbox/OscdSclCheckbox.js';
import { OscdSclSelect } from '@omicronenergy/oscd-ui/scl-select/OscdSclSelect.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import { changeGSEContent, controlBlockGseOrSmv, identity, updateGSEControl, } from '@openscd/scl-lib';
import { maxLength, patterns, typeNullable, typePattern, } from '../../foundation/pattern.js';
import { checkGSEDiff } from '../../foundation/utils/gse.js';
function pElementContent(gse, type) {
    return (Array.from(gse.querySelectorAll(':scope > Address > P'))
        .find(p => p.getAttribute('type') === type)
        ?.textContent?.trim() ?? null);
}
const gseHelpers = {
    'MAC-Address': 'MAC address (01-0C-CD-01-xx-xx)',
    APPID: 'APP ID (4 hex values)',
    'VLAN-ID': 'VLAN ID (3 hex value)',
    'VLAN-PRIORITY': 'VLAN Priority (0-7)',
};
const gsePlaceholders = {
    'MAC-Address': '01-0C-CD-01-xx-xx',
    APPID: '0000',
    'VLAN-ID': '000',
    'VLAN-PRIORITY': '4',
};
export class GseControlElementEditor extends ScopedElementsMixin(LitElement) {
    constructor() {
        super(...arguments);
        /** The element being edited as provided to plugins by [[`OpenSCD`]]. */
        this.element = null;
        this.gSEdiff = false;
        this.gSEControlDiff = false;
    }
    get gSE() {
        return this.element ? controlBlockGseOrSmv(this.element) : null;
    }
    resetInputs(type = 'GSEControl') {
        this.element = null; // removes inputs and forces a re-render
        // resets save button
        this.gSEdiff = false;
        this.gSEControlDiff = false;
        if (type === 'GSEControl') {
            for (const input of this.gSEControlInputs) {
                if (input instanceof OscdSclTextField) {
                    input.reset();
                }
            }
        }
        if (type === 'GSE') {
            for (const input of this.gSEInputs) {
                if (input instanceof OscdSclTextField) {
                    input.reset();
                }
            }
        }
    }
    onGSEControlInputChange() {
        if (!this.element) {
            return;
        }
        if (Array.from(this.gSEControlInputs ?? []).some(input => !input.reportValidity())) {
            this.gSEControlDiff = false;
            return;
        }
        const gSEControlAttrs = {};
        for (const input of this.gSEControlInputs ?? []) {
            gSEControlAttrs[input.label] = input.value;
        }
        this.gSEControlDiff = Array.from(this.gSEControlInputs ?? []).some(input => this.element.getAttribute(input.label) !== input.value);
    }
    saveGSEControlChanges() {
        if (!this.element) {
            return;
        }
        const gSEControlAttrs = {};
        for (const input of this.gSEControlInputs ?? []) {
            if (this.element?.getAttribute(input.label) !== input.value) {
                gSEControlAttrs[input.label] = input.value;
            }
        }
        this.dispatchEvent(newEditEventV2(updateGSEControl({
            element: this.element,
            attributes: gSEControlAttrs,
        }), { title: `Update GSEControl ${identity(this.element)}` }));
        this.resetInputs();
        this.onGSEControlInputChange();
    }
    onGSEInputChange() {
        if (!this.element) {
            return;
        }
        if (Array.from(this.gSEInputs ?? []).some(input => !input.reportValidity())) {
            this.gSEdiff = false;
            return;
        }
        const gSEAttrs = {};
        for (const input of this.gSEInputs ?? []) {
            gSEAttrs[input.label] = input.value;
        }
        this.gSEdiff = checkGSEDiff(this.gSE, gSEAttrs, this.instType?.checked);
    }
    saveGSEChanges() {
        if (!this.gSE) {
            return;
        }
        const options = { address: {}, timing: {} };
        for (const input of this.gSEInputs ?? []) {
            if (input.label === 'MAC-Address' && input.value) {
                options.address.mac = input.value;
            }
            if (input.label === 'APPID' && input.value) {
                options.address.appId = input.value;
            }
            if (input.label === 'VLAN-ID' && input.value) {
                options.address.vlanId = input.value;
            }
            if (input.label === 'VLAN-PRIORITY' && input.value) {
                options.address.vlanPriority = input.value;
            }
            if (input.label === 'MinTime' && input.value) {
                options.timing.MinTime = input.value;
            }
            if (input.label === 'MaxTime' && input.value) {
                options.timing.MaxTime = input.value;
            }
        }
        if (this.instType?.checked === true) {
            options.address.instType = true;
        }
        else if (this.instType?.checked === false) {
            options.address.instType = false;
        }
        this.dispatchEvent(newEditEventV2(changeGSEContent(this.gSE, options), {
            title: `Update GSE ${identity(this.gSE)}`,
        }));
        this.resetInputs('GSE');
        this.onGSEInputChange();
    }
    renderGseContent() {
        const { gSE } = this;
        if (!gSE) {
            return html `<div class="content">
        <h3>
          <div>Communication Settings (GSE)</div>
          <div class="headersubtitle">No connection to SubNetwork</div>
        </h3>
      </div>`;
        }
        const minTime = gSE.querySelector('MinTime')?.innerHTML.trim() ?? null;
        const maxTime = gSE.querySelector('MaxTime')?.innerHTML.trim() ?? null;
        const hasInstType = Array.from(gSE.querySelectorAll('Address > P')).some(pType => pType.getAttribute('xsi:type'));
        const attributes = {};
        ['MAC-Address', 'APPID', 'VLAN-ID', 'VLAN-PRIORITY'].forEach((key) => {
            if (!attributes[key]) {
                attributes[key] = pElementContent(gSE, key);
            }
        });
        return html `<div class="content gse">
      <h3>Communication Settings (GSE)</h3>
      <form>
        <oscd-checkbox
          id="instType"
          ?checked="${hasInstType}"
          @change=${this.onGSEInputChange}
        ></oscd-checkbox>
        <label class="insttype label">Add XMLSchema-instance type</label>
      </form>
      ${Object.entries(attributes).map(([key, value]) => html `<oscd-scl-text-field
            label="${key}"
            ?nullable=${typeNullable[key]}
            .value=${value}
            pattern="${typePattern[key]}"
            required
            supportingText="${gseHelpers[key]}"
            placeholder="${gsePlaceholders[key]}"
            @input=${this.onGSEInputChange}
          ></oscd-scl-text-field>`)}<oscd-scl-text-field
        label="MinTime"
        .value=${minTime}
        nullable
        supportingText="Min repetition interval"
        suffixText="ms"
        type="number"
        @input=${this.onGSEInputChange}
      ></oscd-scl-text-field
      ><oscd-scl-text-field
        label="MaxTime"
        .value=${maxTime}
        nullable
        supportingText="Max repetition interval"
        suffixText="ms"
        type="number"
        @input=${this.onGSEInputChange}
      ></oscd-scl-text-field>
      <oscd-text-button
        class="save"
        ?disabled=${!this.gSEdiff}
        @click=${() => this.saveGSEChanges()}
        >Save<oscd-icon slot="icon">save</oscd-icon></oscd-text-button
      >
    </div>`;
    }
    renderGseControlContent() {
        const [name, desc, confRev, type, appID, fixedOffs, securityEnabled] = [
            'name',
            'desc',
            'confRev',
            'type',
            'appID',
            'fixedOffs',
            'securityEnabled',
        ].map(attr => this.element.getAttribute(attr));
        /*
        const reservedGseControlNames = Array.from(
          this.element!.parentElement?.querySelectorAll('GSEControl') ?? []
        )
          .map(gseControl => gseControl.getAttribute('name')!)
          .filter(
            gseControlName => gseControlName !== this.element!.getAttribute('name')
          ); */
        return html `<div class="content gsecontrol">
      <oscd-scl-text-field
        class="input gsecontrol"
        label="name"
        .value=${name}
        supportingText="GSEControl Name"
        required
        pattern="${patterns.asciName}"
        maxLength="${maxLength.cbName}"
        minLength="0"
        dialogInitialFocus
        @input=${this.onGSEControlInputChange}
      ></oscd-scl-text-field>
      <oscd-scl-text-field
        class="input gsecontrol"
        label="desc"
        .value=${desc}
        nullable
        supportingText="GSEControl Description"
        @input=${this.onGSEControlInputChange}
      ></oscd-scl-text-field>
      <oscd-scl-select
        class="input gsecontrol"
        label="type"
        .value=${type}
        supportingText="GOOSE or GSSE"
        nullable
        required
        .selectOptions=${['GOOSE', 'GSSE']}
        @input=${this.onGSEControlInputChange}
      ></oscd-scl-select>
      <oscd-scl-text-field
        class="input gsecontrol"
        label="confRev"
        .value=${confRev}
        supportingText="Configuration Revision"
        pattern="${patterns.unsigned}"
        nullable
        @input=${this.onGSEControlInputChange}
      ></oscd-scl-text-field>
      <oscd-scl-text-field
        class="input gsecontrol"
        label="appID"
        .value=${appID}
        supportingText="GSEControl ID"
        required
        @input=${this.onGSEControlInputChange}
      ></oscd-scl-text-field>
      <oscd-scl-checkbox
        class="input gsecontrol"
        label="fixedOffs"
        .value=${fixedOffs}
        nullable
        supportingText="Whether ASN.1 coding is done with fixed offsets"
        @input=${this.onGSEControlInputChange}
      ></oscd-scl-checkbox>
      <oscd-scl-select
        class="input gsecontrol"
        label="securityEnabled"
        .value=${securityEnabled}
        nullable
        required
        helper="GSEControl Security Settings"
        @input=${this.onGSEControlInputChange}
        .selectOptions=${['None', 'Signature', 'SignatureAndEncryption']}
      ></oscd-scl-select>
      <oscd-text-button
        class="save"
        ?disabled=${!this.gSEControlDiff}
        @click=${() => this.saveGSEControlChanges()}
        >Save<oscd-icon slot="icon">save</oscd-icon></oscd-text-button
      >
    </div>`;
    }
    render() {
        if (!this.element) {
            return html `<h2 style="display: flex;">No GSEControl selected</h2>`;
        }
        return html `<h2 style="display: flex;">
        <div style="flex:auto">
          <div>GSEControl</div>
          <div class="headersubtitle">${identity(this.element)}</div>
        </div>
      </h2>
      <div class="parentcontent">
        ${this.renderGseControlContent()}${this.renderGseContent()}
      </div>`;
    }
}
GseControlElementEditor.scopedElements = {
    'oscd-scl-text-field': OscdSclTextField,
    'oscd-scl-select': OscdSclSelect,
    'oscd-scl-checkbox': OscdSclCheckbox,
    'oscd-text-button': OscdTextButton,
    'oscd-icon': OscdIcon,
    'oscd-checkbox': OscdCheckbox,
};
GseControlElementEditor.styles = css `
    .parentcontent {
      display: grid;
      grid-gap: 12px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(316px, auto));
    }

    .content {
      display: flex;
      flex-direction: column;
      border-left: thick solid var(--md-sys-color-on-primary);
    }

    .content > * {
      display: block;
      margin: 4px 8px 16px;
    }

    .save {
      align-self: flex-end;
    }

    h2,
    h3 {
      color: var(--md-sys-color-on-surface);
      font-family: var(--oscd-text-font), sans-serif;
      font-weight: 300;
      margin: 4px 8px 16px;
      padding-left: 0.3em;
    }

    .headersubtitle {
      font-size: 16px;
      font-weight: 200;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .insttype.label {
      margin-left: 10px;
      font-family: var(--oscd-text-font), sans-serif;
      font-weight: 300;
      color: var(--oscd-theme-base00);
    }

    *[iconTrailing='search'] {
      --md-outlined-text-field-container-shape: 28px;
    }

    @media (max-width: 950px) {
      .content {
        border-left: 0px solid var(--md-sys-color-on-primary);
      }
    }
  `;
__decorate([
    property({ attribute: false })
], GseControlElementEditor.prototype, "element", void 0);
__decorate([
    property({ attribute: false })
], GseControlElementEditor.prototype, "docVersion", void 0);
__decorate([
    property({ attribute: false })
], GseControlElementEditor.prototype, "gSE", null);
__decorate([
    state()
], GseControlElementEditor.prototype, "gSEdiff", void 0);
__decorate([
    state()
], GseControlElementEditor.prototype, "gSEControlDiff", void 0);
__decorate([
    queryAll('.content.gse > oscd-scl-text-field')
], GseControlElementEditor.prototype, "gSEInputs", void 0);
__decorate([
    query('.content.gse > .save')
], GseControlElementEditor.prototype, "gseSave", void 0);
__decorate([
    queryAll('.input.gsecontrol')
], GseControlElementEditor.prototype, "gSEControlInputs", void 0);
__decorate([
    query('.content.gsecontrol > .save')
], GseControlElementEditor.prototype, "gseControlSave", void 0);
__decorate([
    query('#instType')
], GseControlElementEditor.prototype, "instType", void 0);
//# sourceMappingURL=gse-control-element-editor.js.map
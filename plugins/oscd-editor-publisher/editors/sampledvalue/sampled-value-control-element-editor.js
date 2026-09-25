import { __decorate } from "tslib";
import { css, html, LitElement } from 'lit';
import { property, query, queryAll, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { OscdCheckbox } from '@omicronenergy/oscd-ui/checkbox/OscdCheckbox.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';
import { OscdSclCheckbox } from '@omicronenergy/oscd-ui/scl-checkbox/OscdSclCheckbox.js';
import { OscdSclSelect } from '@omicronenergy/oscd-ui/scl-select/OscdSclSelect.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import { changeSMVContent, controlBlockGseOrSmv, identity, updateSampledValueControl, } from '@openscd/scl-lib';
import { maxLength, patterns, typeNullable, typePattern, } from '../../foundation/pattern.js';
import { checkSMVDiff } from '../../foundation/utils/smv.js';
function pElementContent(smv, type) {
    return (Array.from(smv.querySelectorAll(':scope > Address > P'))
        .find(p => p.getAttribute('type') === type)
        ?.textContent?.trim() ?? null);
}
const smvOptsHelpers = {
    refreshTime: 'SMV stream includes refresh time',
    sampleSynchronized: 'SMV stream includes synchronized information',
    sampleRate: 'SMV streams includes sampled rate information',
    dataSet: 'SMV streams includes data set reference',
    security: 'SMV streams includes security setting',
    timestamp: 'SMV streams includes time stamp information',
    synchSourceId: 'SMV streams includes synchronization source',
};
const smvHelpers = {
    'MAC-Address': 'MAC address (01-0C-CD-04-xx-xx)',
    APPID: 'APP ID (4xxx in hex)',
    'VLAN-ID': 'VLAN ID (XXX in hex)',
    'VLAN-PRIORITY': 'VLAN Priority (0-7)',
};
const smvPlaceholders = {
    'MAC-Address': '01-0C-CD-02-xx-xx',
    APPID: '4xxx',
    'VLAN-ID': '000',
    'VLAN-PRIORITY': '4',
};
export class SampledValueControlElementEditor extends ScopedElementsMixin(LitElement) {
    constructor() {
        super(...arguments);
        /** The element being edited as provided to plugins by [[`OpenSCD`]]. */
        this.element = null;
        this.sMVdiff = false;
        this.smvOptsDiff = false;
        this.sampledValueControlDiff = false;
    }
    get sMV() {
        return this.element ? controlBlockGseOrSmv(this.element) : null;
    }
    resetInputs(type = 'SampledValueControl') {
        this.element = null; // removes inputs and forces a re-render
        // resets save button
        this.sMVdiff = false;
        this.sampledValueControlDiff = false;
        if (type === 'SampledValueControl') {
            for (const input of this.sampledValueControlInputs) {
                if (input instanceof OscdSclTextField) {
                    input.reset();
                }
            }
        }
        if (type === 'SMV') {
            for (const input of this.sMVInputs) {
                if (input instanceof OscdSclTextField) {
                    input.reset();
                }
            }
        }
    }
    onSampledValueControlInputChange() {
        if (Array.from(this.sampledValueControlInputs).some(input => !input.reportValidity())) {
            this.sampledValueControlDiff = false;
            return;
        }
        const sampledValueControlAttrs = {};
        for (const input of this.sampledValueControlInputs) {
            sampledValueControlAttrs[input.label] = input.value;
        }
        this.sampledValueControlDiff = Array.from(this.sampledValueControlInputs).some(input => this.element?.getAttribute(input.label) !== input.value);
    }
    saveSampledValueControlChanges() {
        if (!this.element) {
            return;
        }
        const sampledValueControlAttrs = {};
        for (const input of this.sampledValueControlInputs) {
            if (this.element?.getAttribute(input.label) !== input.value) {
                sampledValueControlAttrs[input.label] = input.value;
            }
        }
        this.dispatchEvent(newEditEventV2(updateSampledValueControl({
            element: this.element,
            attributes: sampledValueControlAttrs,
        }), { title: `Update SampledValueControl ${identity(this.element)}` }));
        this.resetInputs();
        this.onSampledValueControlInputChange();
    }
    onSMVInputChange() {
        if (!this.sMV) {
            return;
        }
        if (Array.from(this.sMVInputs).some(input => !input.reportValidity())) {
            this.sMVdiff = false;
            return;
        }
        const pTypes = {};
        for (const input of this.sMVInputs) {
            pTypes[input.label] = input.value;
        }
        this.sMVdiff = checkSMVDiff(this.sMV, {
            pTypes,
            instType: this.instType?.checked,
        });
    }
    saveSMVChanges() {
        if (!this.sMV) {
            return;
        }
        const options = {};
        for (const input of this.sMVInputs) {
            if (input.label === 'MAC-Address' && input.value) {
                options.mac = input.value;
            }
            if (input.label === 'APPID' && input.value) {
                options.appId = input.value;
            }
            if (input.label === 'VLAN-ID' && input.value) {
                options.vlanId = input.value;
            }
            if (input.label === 'VLAN-PRIORITY' && input.value) {
                options.vlanPriority = input.value;
            }
        }
        if (this.instType?.checked === true) {
            options.instType = true;
        }
        else if (this.instType?.checked === false) {
            options.instType = false;
        }
        this.dispatchEvent(newEditEventV2(changeSMVContent(this.sMV, options), {
            title: `Update SampledValueControl SMV ${identity(this.element)}`,
        }));
        this.resetInputs('SMV');
        this.onSMVInputChange();
    }
    onSmvOptsInputChange() {
        if (!this.element) {
            return;
        }
        const smvOpts = this.element.querySelector(':scope > SmvOpts');
        const smvOptsAttrs = {};
        for (const input of this.smvOptsInputs) {
            smvOptsAttrs[input.label] = input.value;
        }
        this.smvOptsDiff = Array.from(this.smvOptsInputs).some(input => smvOpts?.getAttribute(input.label) !== input.value);
    }
    saveSmvOptsChanges() {
        const smvOpts = this.element.querySelector(':scope > SmvOpts');
        if (!smvOpts) {
            return;
        }
        const smvOptsAttrs = {};
        for (const input of this.smvOptsInputs) {
            if (smvOpts.getAttribute(input.label) !== input.value) {
                smvOptsAttrs[input.label] = input.value;
            }
        }
        const updateEdit = { element: smvOpts, attributes: smvOptsAttrs };
        this.dispatchEvent(newEditEventV2(updateEdit, {
            title: `Update SampledValueControl Options ${identity(this.element)}`,
        }));
        this.onSmvOptsInputChange();
    }
    renderSmvContent() {
        const { sMV } = this;
        if (!sMV) {
            return html ` <h3>
        <div>Communication Settings (SMV)</div>
        <div class="headersubtitle">No connection available</div>
      </h3>`;
        }
        const hasInstType = Array.from(sMV.querySelectorAll(':scope > Address > P')).some(pType => pType.getAttribute('xsi:type'));
        const attributes = {};
        ['MAC-Address', 'APPID', 'VLAN-ID', 'VLAN-PRIORITY'].forEach((key) => {
            if (!attributes[key]) {
                attributes[key] = pElementContent(sMV, key);
            }
        });
        return html ` <div class="content smv">
        <h3>Communication Settings (SMV)</h3>
        <form>
          <oscd-checkbox
            class="smv insttype"
            ?checked="${hasInstType}"
            @change=${this.onSMVInputChange}
          ></oscd-checkbox>
          <label class="insttype label">Add XMLSchema-instance type</label>
        </form>
        ${Object.entries(attributes).map(([key, value]) => html `<oscd-scl-text-field
              class="smv attribute"
              label="${key}"
              ?nullable=${typeNullable[key]}
              .value=${value}
              pattern="${typePattern[key]}"
              required
              supportingText="${smvHelpers[key]}"
              placeholder="${smvPlaceholders[key]}"
              @input=${this.onSMVInputChange}
            ></oscd-scl-text-field>`)}
      </div>
      <oscd-text-button
        class="smv save"
        ?disabled=${!this.sMVdiff}
        @click=${() => this.saveSMVChanges()}
        >Save<oscd-icon slot="icon">save</oscd-icon></oscd-text-button
      >`;
    }
    renderSmvOptsContent() {
        const [refreshTime, sampleSynchronized, sampleRate, dataSet, security, timestamp, synchSourceId,] = [
            'refreshTime',
            'sampleSynchronized',
            'sampleRate',
            'dataSet',
            'security',
            'timestamp',
            'synchSourceId',
        ].map(attr => this.element.querySelector('SmvOpts')?.getAttribute(attr) ?? null);
        return html `<div class="content smvopts">
        <h3>Sampled Value Options</h3>
        ${Object.entries({
            refreshTime,
            sampleSynchronized,
            sampleRate,
            dataSet,
            security,
            timestamp,
            synchSourceId,
        }).map(([key, value]) => html `<oscd-scl-checkbox
              class="smvopts attribute"
              label="${key}"
              .value=${value}
              nullable
              helper="${smvOptsHelpers[key]}"
              @input=${this.onSmvOptsInputChange}
            ></oscd-scl-checkbox>`)}
      </div>
      <oscd-text-button
        class="smvopts save"
        ?disabled=${!this.smvOptsDiff}
        @click=${() => this.saveSmvOptsChanges()}
        >Save<oscd-icon slot="icon">save</oscd-icon></oscd-text-button
      >`;
    }
    renderOtherElements() {
        return html `<div class="content">
      ${this.renderSmvOptsContent()}${this.renderSmvContent()}
    </div>`;
    }
    renderSmvControlContent() {
        const [name, desc, confRev, multicast, smvID, smpMod, smpRate, nofASDU, securityEnabled,] = [
            'name',
            'desc',
            'confRev',
            'multicast',
            'smvID',
            'smpMod',
            'smpRate',
            'nofASDU',
            'securityEnabled',
        ].map(attr => this.element?.getAttribute(attr));
        return html `<div class="content smvcontrol">
      <oscd-scl-text-field
        class="smvcontrol attribute"
        label="name"
        .value=${name}
        supportingText="Sampled Value Name"
        required
        pattern="${patterns.asciName}"
        maxLength="${maxLength.cbName}"
        dialogInitialFocus
        @input="${this.onSampledValueControlInputChange}"
      ></oscd-scl-text-field>
      <oscd-scl-text-field
        class="smvcontrol attribute"
        label="desc"
        .value=${desc}
        nullable
        supportingText="Sampled Value Description"
        @input="${this.onSampledValueControlInputChange}"
      ></oscd-scl-text-field>
      ${multicast === null || multicast === 'true'
            ? html ``
            : html `<oscd-scl-checkbox
            class="smvcontrol attribute"
            label="multicast"
            .value=${multicast}
            supportingText="Whether Sample Value Stream is multicast"
            @input="${this.onSampledValueControlInputChange}"
          ></oscd-scl-checkbox>`}
      <oscd-scl-text-field
        class="smvcontrol attribute"
        label="confRev"
        .value=${confRev}
        supportingText="Configuration Revision"
        pattern="${patterns.unsigned}"
        nullable
        @input=${this.onSampledValueControlInputChange}
      ></oscd-scl-text-field>
      <oscd-scl-text-field
        class="smvcontrol attribute"
        label="smvID"
        .value=${smvID}
        supportingText="Sampled Value ID"
        required
        @input="${this.onSampledValueControlInputChange}"
      ></oscd-scl-text-field>
      <oscd-scl-select
        class="smvcontrol attribute"
        label="smpMod"
        .value=${smpMod}
        nullable
        required
        supportingText="Sample mode (Samples per Second, Sampled per Period, Seconds per Sample)"
        @input="${this.onSampledValueControlInputChange}"
        .selectOptions=${['SmpPerPeriod', 'SmpPerSec', 'SecPerSmp']}
      ></oscd-scl-select>
      <oscd-scl-text-field
        class="smvcontrol attribute"
        label="smpRate"
        .value=${smpRate}
        supportingText="Sample Rate (Based on Sample Mode)"
        required
        type="number"
        @input="${this.onSampledValueControlInputChange}"
      ></oscd-scl-text-field>
      <oscd-scl-text-field
        class="smvcontrol attribute"
        label="nofASDU"
        .value=${nofASDU}
        supportingText="Number of Samples per Ethernet packet"
        required
        type="number"
        min="0"
        @input="${this.onSampledValueControlInputChange}"
      ></oscd-scl-text-field>
      <oscd-scl-select
        class="smvcontrol attribute"
        label="securityEnabled"
        .value=${securityEnabled}
        nullable
        required
        supportingText="Sampled Value Security Setting"
        @input="${this.onSampledValueControlInputChange}"
        .selectOptions=${['None', 'Signature', 'SignatureAndEncryption']}
      ></oscd-scl-select
      ><oscd-text-button
        class="smvcontrol save"
        label="save"
        icon="save"
        ?disabled=${!this.sampledValueControlDiff}
        @click="${this.saveSampledValueControlChanges}"
        >Save<oscd-icon slot="save"></oscd-icon
      ></oscd-text-button>
    </div>`;
    }
    render() {
        if (!this.element) {
            return html `<h2 style="display: flex;">
        No SampledValueControl selected
      </h2>`;
        }
        return html `<h2 style="display: flex;">
        <div style="flex:auto">
          <div>SampledValueControl</div>
          <div class="headersubtitle">${identity(this.element)}</div>
        </div>
      </h2>
      <div class="parentcontent">
        ${this.renderSmvControlContent()}${this.renderOtherElements()}
      </div>`;
    }
}
SampledValueControlElementEditor.scopedElements = {
    'oscd-scl-text-field': OscdSclTextField,
    'oscd-scl-select': OscdSclSelect,
    'oscd-scl-checkbox': OscdSclCheckbox,
    'oscd-text-button': OscdTextButton,
    'oscd-icon': OscdIcon,
    'oscd-checkbox': OscdCheckbox,
};
SampledValueControlElementEditor.styles = css `
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

    .save {
      align-self: flex-end;
    }

    .content > * {
      display: block;
      margin: 4px 8px 16px;
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
      font-weight: 300;
      font-family: var(--oscd-text-font), sans-serif;
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
], SampledValueControlElementEditor.prototype, "doc", void 0);
__decorate([
    property({ attribute: false })
], SampledValueControlElementEditor.prototype, "element", void 0);
__decorate([
    property({ attribute: false })
], SampledValueControlElementEditor.prototype, "docVersion", void 0);
__decorate([
    property({ attribute: false })
], SampledValueControlElementEditor.prototype, "sMV", null);
__decorate([
    state()
], SampledValueControlElementEditor.prototype, "sMVdiff", void 0);
__decorate([
    state()
], SampledValueControlElementEditor.prototype, "smvOptsDiff", void 0);
__decorate([
    state()
], SampledValueControlElementEditor.prototype, "sampledValueControlDiff", void 0);
__decorate([
    queryAll('.smvcontrol.attribute')
], SampledValueControlElementEditor.prototype, "sampledValueControlInputs", void 0);
__decorate([
    query('.smvcontrol.save')
], SampledValueControlElementEditor.prototype, "smvControlSave", void 0);
__decorate([
    queryAll('.smv.attribute')
], SampledValueControlElementEditor.prototype, "sMVInputs", void 0);
__decorate([
    query('.smv.save')
], SampledValueControlElementEditor.prototype, "smvSave", void 0);
__decorate([
    queryAll('.smvopts.attribute')
], SampledValueControlElementEditor.prototype, "smvOptsInputs", void 0);
__decorate([
    query('.smvopts.save')
], SampledValueControlElementEditor.prototype, "smvOptsSave", void 0);
__decorate([
    query('.smv.insttype')
], SampledValueControlElementEditor.prototype, "instType", void 0);
//# sourceMappingURL=sampled-value-control-element-editor.js.map
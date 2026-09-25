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
import { getReference, identity, updateReportControl } from '@openscd/scl-lib';
import { createElement } from '@openscd/scl-lib/dist/foundation/utils.js';
import { maxLength, patterns } from '../../foundation/pattern.js';
import { updateMaxClients } from './foundation.js';
const optFieldsHelpers = {
    seqNum: 'Whether Report includes Sequence Number',
    timeStamp: 'Whether Report includes Time Stamp',
    dataSet: 'Whether Report includes DataSet reference',
    reasonCode: 'Whether Report includes reason for trigger',
    dataRef: 'Whether Report includes structure of DataSet',
    entryID: 'Whether Report includes ID for Report',
    configRef: 'Whether Report includes Configuration Revision',
    bufOvfl: 'Whether Report includes indicator for buffer overflow',
};
const trgOpsHelpers = {
    dchg: 'Trigger Report through data change',
    qchg: 'Trigger Report through data quality change',
    dupd: 'Trigger Report through data update',
    period: 'Periodically send Report',
    gi: 'Allow trigger Report manually',
};
function checkRptEnabledValidity(rptEnabled, input) {
    if (!input.checkValidity()) {
        return false;
    }
    if (!rptEnabled) {
        return true;
    }
    const clientLNs = Array.from(rptEnabled.querySelectorAll(':scope > ClientLN'));
    const maxRpt = input.value ?? '0';
    if (clientLNs.length <= parseInt(maxRpt, 10)) {
        return true;
    }
    input.setCustomValidity(`There are ${clientLNs.length} clientLNs`);
    return false;
}
export class ReportControlElementEditor extends ScopedElementsMixin(LitElement) {
    constructor() {
        super(...arguments);
        /** The element being edited as provided to plugins by [[`OpenSCD`]]. */
        this.element = null;
        this.optFieldsDiff = false;
        this.trgOpsDiff = false;
        this.reportControlDiff = false;
    }
    resetInputs() {
        this.element = null; // removes inputs and forces a re-render
        // reset save button
        this.optFieldsDiff = false;
        this.trgOpsDiff = false;
        this.reportControlDiff = false;
        for (const input of this.reportControlInputs) {
            if (input instanceof OscdSclTextField) {
                input.reset();
            }
        }
    }
    onOptFieldsInputChange() {
        const optFields = this.element.querySelector(':scope > OptFields');
        const optFieldsAttrs = {};
        for (const input of this.optFieldsInputs) {
            optFieldsAttrs[input.label] = input.value;
        }
        this.optFieldsDiff = Array.from(this.optFieldsInputs).some(input => optFields?.getAttribute(input.label) !== input.value);
    }
    saveOptFieldChanges() {
        if (!this.element) {
            return;
        }
        const optFields = this.element.querySelector(':scope > OptFields');
        const optFieldAttrs = {};
        for (const input of this.optFieldsInputs ?? []) {
            if (optFields?.getAttribute(input.label) !== input.value) {
                optFieldAttrs[input.label] = input.value;
            }
        }
        if (!optFields) {
            const node = createElement(this.element.ownerDocument, 'OptFields', optFieldAttrs);
            this.dispatchEvent(newEditEventV2({
                parent: this.element,
                node,
                reference: getReference(this.element, 'OptFields'),
            }, { title: `Update ReportControl OptFields ${this.element}` }));
        }
        else {
            const updateEdit = { element: optFields, attributes: optFieldAttrs };
            this.dispatchEvent(newEditEventV2(updateEdit, {
                title: `Update ReportControl OptFields ${this.element}`,
            }));
        }
        this.onOptFieldsInputChange();
    }
    onTrgOpsInputChange() {
        if (!this.element) {
            return;
        }
        const trgOps = this.element.querySelector(':scope > TrgOps');
        const trgOpsAttrs = {};
        for (const input of this.trgOpsInputs) {
            trgOpsAttrs[input.label] = input.value;
        }
        this.trgOpsDiff = Array.from(this.trgOpsInputs).some(input => trgOps?.getAttribute(input.label) !== input.value);
    }
    saveTrgOpsChanges() {
        if (!this.element) {
            return;
        }
        const trgOps = this.element.querySelector(':scope > TrgOps');
        const trgOpsAttrs = {};
        for (const input of this.trgOpsInputs ?? []) {
            if (trgOps?.getAttribute(input.label) !== input.value) {
                trgOpsAttrs[input.label] = input.value;
            }
        }
        if (!trgOps) {
            const node = createElement(this.element.ownerDocument, 'TrgOps', trgOpsAttrs);
            this.dispatchEvent(newEditEventV2({
                parent: this.element,
                node,
                reference: getReference(this.element, 'TrgOps'),
            }, { title: `Update ReportControl Triggers ${this.element}` }));
        }
        else {
            const updateEdit = { element: trgOps, attributes: trgOpsAttrs };
            this.dispatchEvent(newEditEventV2(updateEdit, {
                title: `Update ReportControl Triggers ${this.element}`,
            }));
        }
        this.onTrgOpsInputChange();
    }
    onReportControlInputChange() {
        if (!this.element) {
            return;
        }
        const reportControl = this.element;
        const rptEnabled = reportControl.querySelector(':scope > RptEnabled');
        const someInvalidAttrs = Array.from(this.reportControlInputs).some(input => !input.checkValidity());
        if (someInvalidAttrs ||
            !checkRptEnabledValidity(rptEnabled, this.rptEnabledInput)) {
            this.reportControlDiff = false;
            return;
        }
        const reportControlAttrs = {};
        for (const input of this.reportControlInputs) {
            reportControlAttrs[input.label] = input.value;
        }
        const someAttrDiff = Array.from(this.reportControlInputs).some(input => reportControl?.getAttribute(input.label) !== input.value);
        const rptEnabledDiff = (rptEnabled?.getAttribute('max') ?? null) !== this.rptEnabledInput.value;
        this.reportControlDiff = someAttrDiff || rptEnabledDiff;
    }
    saveReportControlChanges() {
        const reportControl = this.element;
        const reportControlAttrs = {};
        for (const input of this.reportControlInputs ?? []) {
            if (reportControl.getAttribute(input.label) !== input.value) {
                reportControlAttrs[input.label] = input.value;
            }
        }
        const reportControlActions = updateReportControl({
            element: reportControl,
            attributes: reportControlAttrs,
        });
        const max = this.rptEnabledInput.value;
        const rptEnabledAction = updateMaxClients(reportControl, max);
        if (!rptEnabledAction) {
            this.dispatchEvent(newEditEventV2(reportControlActions, {
                title: `Update ReportControl ${this.element}`,
            }));
        }
        else {
            this.dispatchEvent(newEditEventV2([...reportControlActions, rptEnabledAction], {
                title: `Update ReportControl ${this.element}`,
            }));
        }
        this.resetInputs();
        this.onReportControlInputChange();
    }
    renderOptFieldsContent() {
        const [seqNum, timeStamp, dataSet, reasonCode, dataRef, entryID, configRef, bufOvfl,] = [
            'seqNum',
            'timeStamp',
            'dataSet',
            'reasonCode',
            'dataRef',
            'entryID',
            'configRef',
            'bufOvfl',
        ].map(attr => this.element.querySelector('OptFields')?.getAttribute(attr) ?? null);
        return html `<div class="content optfields">
        <h3>Optional Fields</h3>
        ${Object.entries({
            seqNum,
            timeStamp,
            dataSet,
            reasonCode,
            dataRef,
            entryID,
            configRef,
            bufOvfl,
        }).map(([key, value]) => html `<oscd-scl-checkbox
              label="${key}"
              .value=${value}
              nullable
              supportingText="${optFieldsHelpers[key]}"
              @input=${this.onOptFieldsInputChange}
            ></oscd-scl-checkbox>`)}
      </div>
      <oscd-text-button
        class="save optfields"
        ?disabled=${!this.optFieldsDiff}
        @click=${() => this.saveOptFieldChanges()}
        >Save<oscd-icon slot="icon">save</oscd-icon></oscd-text-button
      >`;
    }
    renderTrgOpsContent() {
        const [dchg, qchg, dupd, period, gi] = [
            'dchg',
            'qchg',
            'dupd',
            'period',
            'gi',
        ].map(attr => this.element.querySelector('TrgOps')?.getAttribute(attr) ?? null);
        return html `<div class="content trgops">
        <h3>Trigger Options</h3>
        ${Object.entries({ dchg, qchg, dupd, period, gi }).map(([key, value]) => html `<oscd-scl-checkbox
              label="${key}"
              .value=${value}
              nullable
              supportingText="${trgOpsHelpers[key]}"
              @input=${async (evt) => {
            await evt.target.updateComplete;
            this.onTrgOpsInputChange();
        }}
            ></oscd-scl-checkbox>`)}
      </div>
      <oscd-text-button
        class="save trgops"
        ?disabled=${!this.trgOpsDiff}
        @click=${() => this.saveTrgOpsChanges()}
        >Save<oscd-icon slot="icon">save</oscd-icon></oscd-text-button
      >`;
    }
    renderChildElements() {
        return html `<div class="content">
      ${this.renderTrgOpsContent()}${this.renderOptFieldsContent()}
    </div>`;
    }
    renderReportControlContent() {
        const [name, desc, confRev, buffered, rptID, indexed, bufTime, intgPd] = [
            'name',
            'desc',
            'confRev',
            'buffered',
            'rptID',
            'indexed',
            'bufTime',
            'intgPd',
        ].map(attr => this.element?.getAttribute(attr));
        const max = this.element.querySelector('RptEnabled')?.getAttribute('max') ?? null;
        return html `<div class="content reportcontrol">
      <oscd-scl-text-field
        class="report attributes"
        label="name"
        .value=${name}
        supportingText="ReportControl Name"
        required
        pattern="${patterns.asciName}"
        maxLength="${maxLength.cbName}"
        dialogInitialFocus
        @input=${this.onReportControlInputChange}
      ></oscd-scl-text-field
      ><oscd-scl-text-field
        class="report attributes"
        label="desc"
        .value=${desc}
        nullable
        supportingText="ReportControl Description"
        @input=${this.onReportControlInputChange}
      ></oscd-scl-text-field>
      <oscd-scl-text-field
        class="report attributes"
        label="confRev"
        .value=${confRev}
        supportingText="Configuration Revision"
        pattern="${patterns.unsigned}"
        nullable
        @input=${this.onReportControlInputChange}
      ></oscd-scl-text-field>
      <oscd-scl-checkbox
        class="report attributes"
        label="buffered"
        .value=${buffered}
        helper="Whether ReportControl is Buffered"
        @input=${this.onReportControlInputChange}
      ></oscd-scl-checkbox
      ><oscd-scl-text-field
        class="report attributes"
        label="rptID"
        .value=${rptID}
        nullable
        supportingText="ReportControl ID"
        @input=${this.onReportControlInputChange}
      ></oscd-scl-text-field
      ><oscd-scl-checkbox
        class="report attributes"
        label="indexed"
        .value=${indexed}
        nullable
        helper="Allow multiple Instances of this ReportControl"
        @input=${this.onReportControlInputChange}
      ></oscd-scl-checkbox
      ><oscd-scl-text-field
        class="rptenabled attributes"
        label="max Clients"
        .value=${max}
        supportingText="Number of ReportControl Instances"
        nullable
        type="number"
        min="0"
        suffix="#"
        @input=${this.onReportControlInputChange}
      ></oscd-scl-text-field
      ><oscd-scl-text-field
        class="report attributes"
        label="bufTime"
        .value=${bufTime}
        supportingText="Minimum time between two ReportControl"
        nullable
        required
        type="number"
        min="0"
        suffix="ms"
        @input=${this.onReportControlInputChange}
      ></oscd-scl-text-field
      ><oscd-scl-text-field
        class="report attributes"
        label="intgPd"
        .value=${intgPd}
        supportingText="Integrity Period"
        nullable
        required
        type="number"
        min="0"
        suffix="ms"
        @input=${this.onReportControlInputChange}
      ></oscd-scl-text-field>
      <oscd-text-button
        class="save"
        ?disabled=${!this.reportControlDiff}
        @click=${() => this.saveReportControlChanges()}
        >Save<oscd-icon slot="icon">save</oscd-icon></oscd-text-button
      >
    </div>`;
    }
    render() {
        if (this.element) {
            return html `<h2 style="display: flex;">
          <div style="flex:auto">
            <div>ReportControl</div>
            <div class="headersubtitle">${identity(this.element)}</div>
          </div>
        </h2>
        <div class="parentcontent">
          ${this.renderReportControlContent()}${this.renderChildElements()}
        </div>`;
        }
        return html `<div class="parentcontent">
      <h2>No ReportControl loaded</h2>
    </div>`;
    }
}
ReportControlElementEditor.scopedElements = {
    'oscd-scl-text-field': OscdSclTextField,
    'oscd-scl-select': OscdSclSelect,
    'oscd-scl-checkbox': OscdSclCheckbox,
    'oscd-text-button': OscdTextButton,
    'oscd-icon': OscdIcon,
    'oscd-checkbox': OscdCheckbox,
};
ReportControlElementEditor.styles = css `
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

    *[iconTrailing='search'] {
      --md-outlined-text-field-container-shape: 28px;
    }

    @media (max-width: 950px) {
      .parentcontent {
        border-left: 0px solid var(--md-sys-color-on-primary);
      }
    }
  `;
__decorate([
    property({ attribute: false })
], ReportControlElementEditor.prototype, "doc", void 0);
__decorate([
    property({ attribute: false })
], ReportControlElementEditor.prototype, "element", void 0);
__decorate([
    property({ attribute: false })
], ReportControlElementEditor.prototype, "docVersion", void 0);
__decorate([
    state()
], ReportControlElementEditor.prototype, "optFieldsDiff", void 0);
__decorate([
    state()
], ReportControlElementEditor.prototype, "trgOpsDiff", void 0);
__decorate([
    state()
], ReportControlElementEditor.prototype, "reportControlDiff", void 0);
__decorate([
    queryAll('.content.optfields > oscd-scl-checkbox')
], ReportControlElementEditor.prototype, "optFieldsInputs", void 0);
__decorate([
    query('.save.optfields')
], ReportControlElementEditor.prototype, "optFieldsSave", void 0);
__decorate([
    queryAll('.content.trgops > oscd-scl-checkbox')
], ReportControlElementEditor.prototype, "trgOpsInputs", void 0);
__decorate([
    query('.save.trgops')
], ReportControlElementEditor.prototype, "trgOpsSave", void 0);
__decorate([
    queryAll('.report.attributes')
], ReportControlElementEditor.prototype, "reportControlInputs", void 0);
__decorate([
    query('.content.reportcontrol > .save')
], ReportControlElementEditor.prototype, "reportControlSave", void 0);
__decorate([
    query('.rptenabled.attributes')
], ReportControlElementEditor.prototype, "rptEnabledInput", void 0);
//# sourceMappingURL=report-control-element-editor.js.map
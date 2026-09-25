import { __decorate } from "tslib";
import { LitElement, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import { createDataSet, findControlBlockSubscription, identity, } from '@openscd/scl-lib';
export class BaseElementEditor extends ScopedElementsMixin(LitElement) {
    update(props) {
        if (props.has('doc')) {
            this.clearSelectedControlBlock();
        }
        super.update(props);
    }
    selectControlBlock(controlBlock) {
        this.selectedControlBlock = controlBlock;
        this.selectedDataSet =
            controlBlock.parentElement?.querySelector(`:scope > DataSet[name="${controlBlock.getAttribute('datSet')}"]`) ?? null;
    }
    clearSelectedControlBlock() {
        this.selectedControlBlock = undefined;
        this.selectedDataSet = undefined;
    }
    selectDataSet(dataSet) {
        const name = dataSet.getAttribute('name');
        if (!name || !this.selectedControlBlock) {
            return;
        }
        this.dispatchEvent(newEditEventV2({
            element: this.selectedControlBlock,
            attributes: { datSet: name },
        }, {
            title: `Change Data Set of ${identity(this.selectedControlBlock)}`,
        }));
        this.selectedDataSet = dataSet;
        this.selectDataSetDialog.close();
    }
    addNewDataSet(control) {
        const parent = control.parentElement;
        if (!parent) {
            return;
        }
        const insert = createDataSet(parent);
        if (!insert) {
            return;
        }
        const newName = insert.node.getAttribute('name');
        if (!newName) {
            return;
        }
        const update = { element: control, attributes: { datSet: newName } };
        this.dispatchEvent(newEditEventV2([insert, update], { title: 'Add New Data Set' }));
        this.selectedDataSet =
            this.selectedControlBlock?.parentElement?.querySelector(`:scope > DataSet[name="${this.selectedControlBlock.getAttribute('datSet')}"]`);
    }
    showSelectDataSetDialog() {
        this.selectDataSetDialog.show();
    }
    renderSelectDataSetDialog() {
        const items = Array.from(this.selectedControlBlock?.parentElement?.querySelectorAll(':scope > DataSet') ?? []).map(dataSet => ({
            headline: `${dataSet.getAttribute('name')}`,
            supportingText: `${identity(dataSet)}`,
            primaryAction: () => {
                this.selectDataSet(dataSet);
            },
        }));
        return html `<oscd-dialog class="dialog select">
      <oscd-action-list
        slot="content"
        .items=${items}
        filterable
      ></oscd-action-list>
    </oscd-dialog>`;
    }
    renderDataSetElementContainer() {
        return html `
      <div class="content dataSet">
        ${this.renderSelectDataSetDialog()}
        <data-set-element-editor
          .element=${this.selectedDataSet}
          .showHeader=${false}
          .docVersion=${this.docVersion}
        >
          <oscd-icon-button
            class="change dataset"
            slot="change"
            ?disabled=${!!findControlBlockSubscription(this.selectedControlBlock).length}
            @click=${this.showSelectDataSetDialog}
            ><oscd-icon>swap_vert</oscd-icon></oscd-icon-button
          >
          <oscd-icon-button
            class="new dataset"
            slot="new"
            ?disabled=${!!this.selectedControlBlock.getAttribute('datSet')}
            @click="${() => {
            this.addNewDataSet(this.selectedControlBlock);
        }}"
            ><oscd-icon>playlist_add</oscd-icon></oscd-icon-button
          ></data-set-element-editor
        >
      </div>
    `;
    }
}
__decorate([
    property({ attribute: false })
], BaseElementEditor.prototype, "doc", void 0);
__decorate([
    property({ attribute: false })
], BaseElementEditor.prototype, "docVersion", void 0);
__decorate([
    state()
], BaseElementEditor.prototype, "selectedControlBlock", void 0);
__decorate([
    state()
], BaseElementEditor.prototype, "selectedDataSet", void 0);
__decorate([
    query('.dialog.select')
], BaseElementEditor.prototype, "selectDataSetDialog", void 0);
__decorate([
    query('.new.dataset')
], BaseElementEditor.prototype, "newDataSet", void 0);
__decorate([
    query('.change.dataset')
], BaseElementEditor.prototype, "changeDataSet", void 0);
//# sourceMappingURL=base-element-editor.js.map
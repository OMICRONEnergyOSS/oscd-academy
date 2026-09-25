import { __decorate } from "tslib";
import { css, html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { OscdActionList, } from '@omicronenergy/oscd-ui/action-list/OscdActionList.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import { createDataSet, identity, removeDataSet } from '@openscd/scl-lib';
import { DataSetElementEditor } from './data-set-element-editor.js';
import { pathIdentity, styles } from '../../foundation.js';
export class DataSetEditor extends ScopedElementsMixin(LitElement) {
    update(props) {
        if (props.has('doc')) {
            this.selectedDataSet = undefined;
        }
        super.update(props);
    }
    renderElementEditorContainer() {
        if (this.selectedDataSet) {
            return html `<div class="elementeditorcontainer">
        <data-set-element-editor
          .element=${this.selectedDataSet}
          .docVersion=${this.docVersion}
        ></data-set-element-editor>
      </div>`;
        }
        return html ``;
    }
    renderSelectionList() {
        const items = Array.from(this.doc.querySelectorAll(':root > IED')).flatMap((ied) => {
            const dataSets = Array.from(ied.querySelectorAll(':scope > AccessPoint > Server > LDevice > LN0 > DataSet, :scope > AccessPoint > Server > LDevice > LN > DataSet'));
            const item = {
                headline: `${ied.getAttribute('name')}`,
                startingIcon: 'developer_board',
                divider: true,
                filtergroup: dataSets.map(dataset => `${identity(dataset)}`),
                actions: [
                    {
                        icon: 'playlist_add',
                        callback: () => {
                            const insertDataSet = createDataSet(ied);
                            if (insertDataSet) {
                                this.dispatchEvent(newEditEventV2(insertDataSet, {
                                    title: `Create New DataSet`,
                                }));
                            }
                        },
                    },
                ],
            };
            const dataset = dataSets.map(dataSet => ({
                headline: `${dataSet.getAttribute('name')}`,
                supportingText: `${pathIdentity(dataSet)}`,
                primaryAction: () => {
                    if (this.selectedDataSet === dataSet) {
                        return;
                    }
                    if (this.dataSetElementEditor) {
                        this.dataSetElementEditor.resetInputs();
                    }
                    this.selectedDataSet = dataSet;
                    this.selectionList.classList.add('hidden');
                    this.selectDataSetButton.classList.remove('hidden');
                },
                actions: [
                    {
                        icon: 'delete',
                        callback: () => {
                            this.dispatchEvent(newEditEventV2(removeDataSet({ node: dataSet }), {
                                title: `Remove DataSet`,
                            }));
                            this.selectedDataSet = undefined;
                        },
                    },
                ],
            }));
            return [item, ...dataset];
        });
        return html `<oscd-action-list
      class="selectionlist"
      .items=${items}
      filterable
      searchhelper="Filter DataSet's"
    ></oscd-action-list>`;
    }
    renderToggleButton() {
        return html `<oscd-outlined-button
      class="change scl element"
      @click=${() => {
            this.selectionList.classList.remove('hidden');
            this.selectDataSetButton.classList.add('hidden');
        }}
      >Select DataSet</oscd-outlined-button
    >`;
    }
    render() {
        if (!this.doc) {
            return html `<div>No SCL loaded</div>`;
        }
        return html `${this.renderToggleButton()}
      <div class="section">
        ${this.renderSelectionList()}${this.renderElementEditorContainer()}
      </div>`;
    }
}
DataSetEditor.scopedElements = {
    'oscd-action-list': OscdActionList,
    'data-set-element-editor': DataSetElementEditor,
    'oscd-outlined-button': OscdOutlinedButton,
};
DataSetEditor.styles = css `
    ${styles}

    data-set-element-editor {
      flex: auto;
    }

    oscd-icon-button[icon='playlist_add'] {
      pointer-events: all;
    }
  `;
__decorate([
    property({ attribute: false })
], DataSetEditor.prototype, "doc", void 0);
__decorate([
    property({ attribute: false })
], DataSetEditor.prototype, "docVersion", void 0);
__decorate([
    state()
], DataSetEditor.prototype, "selectedDataSet", void 0);
__decorate([
    query('.selectionlist')
], DataSetEditor.prototype, "selectionList", void 0);
__decorate([
    query('.change.scl.element')
], DataSetEditor.prototype, "selectDataSetButton", void 0);
__decorate([
    query('data-set-element-editor')
], DataSetEditor.prototype, "dataSetElementEditor", void 0);
//# sourceMappingURL=data-set-editor.js.map
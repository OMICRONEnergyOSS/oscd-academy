import { __decorate } from "tslib";
import { css, html } from 'lit';
import { query } from 'lit/decorators.js';
import { OscdActionList, } from '@omicronenergy/oscd-ui/action-list/OscdActionList.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import { createGSEControl, removeControlBlock } from '@openscd/scl-lib';
import { pathIdentity, styles } from '../../foundation.js';
import { DataSetElementEditor } from '../dataset/data-set-element-editor.js';
import { GseControlElementEditor } from './gse-control-element-editor.js';
import { BaseElementEditor } from '../base-element-editor.js';
export class GseControlEditor extends BaseElementEditor {
    renderElementEditorContainer() {
        if (this.selectedControlBlock !== undefined) {
            return html `<div class="elementeditorcontainer">
        ${this.renderDataSetElementContainer()}
        <gse-control-element-editor
          .doc=${this.doc}
          .element=${this.selectedControlBlock}
          .docVersion=${this.docVersion}
        ></gse-control-element-editor>
      </div>`;
        }
        return html ``;
    }
    renderSelectionList() {
        const items = Array.from(this.doc.querySelectorAll(':root > IED')).flatMap((ied) => {
            const gseControls = Array.from(ied.querySelectorAll(':scope > AccessPoint > Server > LDevice > LN0 > GSEControl'));
            const item = {
                headline: `${ied.getAttribute('name')}`,
                startingIcon: 'developer_board',
                divider: true,
                filtergroup: gseControls.map(gseControl => gseControl.getAttribute('name') ?? ''),
                actions: [
                    {
                        icon: 'playlist_add',
                        callback: () => {
                            const insertGseControl = createGSEControl(ied);
                            if (insertGseControl) {
                                this.dispatchEvent(newEditEventV2(insertGseControl, {
                                    title: 'Create New GSEControl',
                                }));
                            }
                        },
                    },
                ],
            };
            const dataset = gseControls.map(gseControl => ({
                headline: `${gseControl.getAttribute('name')}`,
                supportingText: `${pathIdentity(gseControl)}`,
                primaryAction: () => {
                    if (this.selectedControlBlock === gseControl) {
                        return;
                    }
                    if (this.gseControlElementEditor) {
                        this.gseControlElementEditor.resetInputs();
                    }
                    if (this.dataSetElementEditor) {
                        this.dataSetElementEditor.resetInputs();
                    }
                    this.selectControlBlock(gseControl);
                    this.selectionList.classList.add('hidden');
                    this.selectGSEControlButton.classList.remove('hidden');
                },
                actions: [
                    {
                        icon: 'delete',
                        callback: () => {
                            this.dispatchEvent(newEditEventV2(removeControlBlock({ node: gseControl }), {
                                title: 'Remove GSEControl',
                            }));
                            this.clearSelectedControlBlock();
                        },
                    },
                ],
            }));
            return [item, ...dataset];
        });
        return html `<oscd-action-list
      class="selectionlist"
      filterable
      searchhelper="Filter GSEControl's"
      .items=${items}
    ></oscd-action-list>`;
    }
    renderToggleButton() {
        return html `<oscd-outlined-button
      class="change scl element"
      @click=${() => {
            this.selectionList.classList.remove('hidden');
            this.selectGSEControlButton.classList.add('hidden');
        }}
      >Selected GOOSE</oscd-outlined-button
    >`;
    }
    render() {
        if (!this.doc) {
            return html `No SCL loaded`;
        }
        return html `${this.renderToggleButton()}
      <div class="section">
        ${this.renderSelectionList()}${this.renderElementEditorContainer()}
      </div>`;
    }
}
GseControlEditor.scopedElements = {
    'oscd-action-list': OscdActionList,
    'data-set-element-editor': DataSetElementEditor,
    'oscd-outlined-button': OscdOutlinedButton,
    'gse-control-element-editor': GseControlElementEditor,
    'oscd-icon-button': OscdIconButton,
    'oscd-icon': OscdIcon,
    'oscd-dialog': OscdDialog,
};
GseControlEditor.styles = css `
    ${styles}

    .elementeditorcontainer {
      flex: 65%;
      margin: 4px 8px 4px 4px;
      background-color: var(--md-sys-color-surface);
      overflow-y: scroll;
      display: grid;
      grid-gap: 12px;
      padding: 8px 12px 16px;
      grid-template-columns: repeat(3, 1fr);
      z-index: 0;
    }
    .content.dataSet {
      display: flex;
      flex-direction: column;
    }

    data-set-element-editor {
      grid-column: 1 / 2;
    }

    gse-control-element-editor {
      grid-column: 2 / 4;
    }

    oscd-list-item {
      --md-list-item-trailing-space: 48px;
    }

    oscd-icon-button[icon='playlist_add'] {
      pointer-events: all;
    }

    @media (max-width: 950px) {
      .elementeditorcontainer {
        display: block;
      }
    }
  `;
__decorate([
    query('.selectionlist')
], GseControlEditor.prototype, "selectionList", void 0);
__decorate([
    query('.change.scl.element')
], GseControlEditor.prototype, "selectGSEControlButton", void 0);
__decorate([
    query('gse-control-element-editor')
], GseControlEditor.prototype, "gseControlElementEditor", void 0);
__decorate([
    query('data-set-element-editor')
], GseControlEditor.prototype, "dataSetElementEditor", void 0);
//# sourceMappingURL=gse-control-editor.js.map
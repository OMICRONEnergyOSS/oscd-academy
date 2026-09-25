import { __decorate } from "tslib";
import { css, html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';
import { OscdTreeGrid } from '@omicronenergy/oscd-ui/tree-grid/OscdTreeGrid.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import { getReference, identity, } from '@openscd/scl-lib';
import { createElement } from '@openscd/scl-lib/dist/foundation/utils.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { OscdOutlinedIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdOutlinedIconButton.js';
export class ClientLnAssignmentDialog extends ScopedElementsMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.selectedClientLnIds = [];
        this.initialClientLnIds = [];
        this.clientLnTreePaths = [];
        this.showSelectedClientLnsOnly = false;
    }
    get allClientLogicalNodes() {
        return Array.from(this.doc.querySelectorAll(':root > IED > AccessPoint > LN, :root > IED > AccessPoint > Server > LDevice > LN, :root > IED > AccessPoint > Server > LDevice > LN0'));
    }
    async open(reportControl) {
        this.clientLnAssignmentReport = reportControl;
        this.selectedClientLnIds = this.assignedClientLogicalNodes(reportControl).map(logicalNode => this.clientLnId(logicalNode));
        this.initialClientLnIds = [...this.selectedClientLnIds];
        this.clientLnTreePaths = this.selectedClientLnIds
            .map(id => this.clientLnTreePathForId(id))
            .filter((path) => path !== null);
        this.showSelectedClientLnsOnly = false;
        await this.updateComplete;
        this.clientLnAssignmentDialog.show();
    }
    clientLnId(logicalNode) {
        const ied = logicalNode.closest('IED');
        const accessPoint = logicalNode.closest('AccessPoint');
        const lDevice = logicalNode.closest('LDevice');
        return [
            ied?.getAttribute('name') ?? '',
            accessPoint?.getAttribute('name') ?? '',
            lDevice?.getAttribute('inst') ?? 'LD0',
            logicalNode.getAttribute('prefix') ?? '',
            logicalNode.getAttribute('lnClass') ?? '',
            logicalNode.getAttribute('inst') ?? '',
        ].join('|');
    }
    isValidClientLogicalNode(logicalNode) {
        const [iedName, , ldInst, , lnClass, lnInst] = this.clientLnId(logicalNode).split('|');
        return (iedName.length > 0 &&
            ldInst.length > 0 &&
            lnClass.length > 0 &&
            lnInst !== undefined);
    }
    clientLnTreePath(logicalNode) {
        const iedName = logicalNode.closest('IED')?.getAttribute('name') ?? '';
        const apName = logicalNode.closest('AccessPoint')?.getAttribute('name') ?? '';
        const lDevice = logicalNode.closest('LDevice');
        const path = [`IED:${iedName}`, `AP:${apName}`];
        if (lDevice) {
            path.push(`LD:${lDevice.getAttribute('inst') ?? ''}`);
        }
        path.push(`LN:${this.clientLnId(logicalNode)}`);
        return path;
    }
    clientLnTreePathForId(id) {
        const logicalNode = this.allClientLogicalNodes.find(candidate => this.clientLnId(candidate) === id);
        return logicalNode ? this.clientLnTreePath(logicalNode) : null;
    }
    clientLnIdForTreePath(path) {
        const leaf = path[path.length - 1];
        if (!leaf?.startsWith('LN:')) {
            return null;
        }
        return leaf.slice(3);
    }
    hasClientLn(reportControl, logicalNode) {
        const [iedName, apRef, ldInst, prefix, lnClass, lnInst] = this.clientLnId(logicalNode).split('|');
        return Array.from(reportControl.querySelectorAll(':scope > RptEnabled > ClientLN')).some(clientLn => (clientLn.getAttribute('iedName') ?? '') === iedName &&
            (clientLn.getAttribute('apRef') ?? '') === apRef &&
            (clientLn.getAttribute('ldInst') ?? '') === ldInst &&
            (clientLn.getAttribute('prefix') ?? '') === prefix &&
            (clientLn.getAttribute('lnClass') ?? '') === lnClass &&
            (clientLn.getAttribute('lnInst') ?? '') === lnInst);
    }
    clientLnForLogicalNode(reportControl, logicalNode) {
        const [iedName, apRef, ldInst, prefix, lnClass, lnInst] = this.clientLnId(logicalNode).split('|');
        return Array.from(reportControl.querySelectorAll(':scope > RptEnabled > ClientLN')).find(clientLn => (clientLn.getAttribute('iedName') ?? '') === iedName &&
            (clientLn.getAttribute('apRef') ?? '') === apRef &&
            (clientLn.getAttribute('ldInst') ?? '') === ldInst &&
            (clientLn.getAttribute('prefix') ?? '') === prefix &&
            (clientLn.getAttribute('lnClass') ?? '') === lnClass &&
            (clientLn.getAttribute('lnInst') ?? '') === lnInst);
    }
    assignedClientLogicalNodes(reportControl) {
        return this.allClientLogicalNodes.filter(logicalNode => this.hasClientLn(reportControl, logicalNode));
    }
    clientLogicalNodesForReport(reportControl) {
        const assigned = this.assignedClientLogicalNodes(reportControl);
        const logicalNodesById = new Map();
        [...this.allClientLogicalNodes, ...assigned]
            .filter(logicalNode => this.isValidClientLogicalNode(logicalNode))
            .forEach((logicalNode) => {
            logicalNodesById.set(this.clientLnId(logicalNode), logicalNode);
        });
        return [...logicalNodesById.values()];
    }
    setTreeNode(tree, path, text, children) {
        let current = tree;
        path.forEach((segment, index) => {
            const isLeaf = index === path.length - 1;
            current[segment] ??= {};
            current[segment].text = isLeaf ? text : current[segment].text;
            if (!isLeaf) {
                current[segment].children ??= {};
                current = current[segment].children;
            }
            else if (children) {
                current[segment].children = children;
            }
        });
    }
    clientLnTreeData(logicalNodes, selectedOnly = false) {
        const selectedIds = new Set(this.selectedClientLnIds);
        const tree = {};
        logicalNodes
            .filter(logicalNode => !selectedOnly || selectedIds.has(this.clientLnId(logicalNode)))
            .forEach((logicalNode) => {
            const iedName = logicalNode.closest('IED')?.getAttribute('name') ?? '';
            const apName = logicalNode.closest('AccessPoint')?.getAttribute('name') ?? '';
            const lDevice = logicalNode.closest('LDevice');
            const basePath = [`IED:${iedName}`, `AP:${apName}`];
            this.setTreeNode(tree, [`IED:${iedName}`], iedName, {});
            this.setTreeNode(tree, basePath, apName, {});
            if (lDevice) {
                const ldInst = lDevice.getAttribute('inst') ?? '';
                this.setTreeNode(tree, [...basePath, `LD:${ldInst}`], ldInst, {});
            }
            this.setTreeNode(tree, this.clientLnTreePath(logicalNode), this.logicalNodeName(logicalNode));
        });
        return tree;
    }
    clientLnInsert(reportControl, logicalNode, parent) {
        return {
            parent,
            node: createElement(reportControl.ownerDocument, 'ClientLN', {
                iedName: logicalNode.closest('IED')?.getAttribute('name') ?? null,
                apRef: logicalNode.closest('AccessPoint')?.getAttribute('name') ?? null,
                ldInst: logicalNode.closest('LDevice')?.getAttribute('inst') ?? 'LD0',
                prefix: logicalNode.getAttribute('prefix') ?? '',
                lnClass: logicalNode.getAttribute('lnClass') ?? '',
                lnInst: logicalNode.getAttribute('inst') ?? '',
            }),
            reference: null,
        };
    }
    updateSelectedClientLns() {
        const reportControl = this.clientLnAssignmentReport;
        if (!reportControl) {
            return;
        }
        const selectedIds = new Set(this.selectedClientLnIds);
        const initialIds = new Set(this.initialClientLnIds);
        const logicalNodesById = new Map(this.clientLogicalNodesForReport(reportControl).map(logicalNode => [this.clientLnId(logicalNode), logicalNode]));
        let rptEnabled = reportControl.querySelector(':scope > RptEnabled');
        const edits = [];
        const clientLnsToAdd = this.selectedClientLnIds
            .filter(id => !initialIds.has(id))
            .map(id => logicalNodesById.get(id))
            .filter((logicalNode) => !!logicalNode);
        const clientLnsToRemove = this.initialClientLnIds
            .filter(id => !selectedIds.has(id))
            .map(id => logicalNodesById.get(id))
            .filter((logicalNode) => !!logicalNode)
            .map(logicalNode => this.clientLnForLogicalNode(reportControl, logicalNode))
            .filter((clientLn) => !!clientLn);
        if (!rptEnabled && clientLnsToAdd.length) {
            rptEnabled = createElement(reportControl.ownerDocument, 'RptEnabled', {
                max: `${Math.max(1, clientLnsToAdd.length)}`,
            });
            edits.push({
                parent: reportControl,
                node: rptEnabled,
                reference: getReference(reportControl, 'RptEnabled'),
            });
        }
        clientLnsToAdd.forEach((logicalNode) => {
            if (!this.hasClientLn(reportControl, logicalNode)) {
                edits.push(this.clientLnInsert(reportControl, logicalNode, rptEnabled));
            }
        });
        clientLnsToRemove.forEach((clientLn) => {
            edits.push({ node: clientLn });
        });
        if (edits.length > 0) {
            this.dispatchEvent(newEditEventV2(edits, {
                title: `Update Client LNs of ReportControl ${identity(reportControl)}`,
            }));
        }
        this.clientLnAssignmentDialog.close();
        this.clientLnAssignmentReport = undefined;
        this.selectedClientLnIds = [];
        this.initialClientLnIds = [];
        this.clientLnTreePaths = [];
        this.showSelectedClientLnsOnly = false;
    }
    handleClientLnTreeClick() {
        window.setTimeout(() => {
            const reportControl = this.clientLnAssignmentReport;
            if (!reportControl || !this.clientLnTreeGrid) {
                return;
            }
            const rptEnabled = reportControl.querySelector(':scope > RptEnabled');
            const maxClients = parseInt(rptEnabled?.getAttribute('max') ?? '1', 10);
            const clientLimit = Number.isNaN(maxClients) ? 1 : maxClients;
            const paths = this.clientLnTreeGrid.paths;
            const selectedIds = paths
                .map(path => this.clientLnIdForTreePath(path))
                .filter((id) => id !== null);
            if (selectedIds.length > clientLimit) {
                const previousIds = new Set(this.selectedClientLnIds);
                const acceptedIds = selectedIds.filter(id => previousIds.has(id));
                selectedIds.some((id) => {
                    if (acceptedIds.length >= clientLimit) {
                        return true;
                    }
                    if (!previousIds.has(id)) {
                        acceptedIds.push(id);
                    }
                    return false;
                });
                const acceptedIdSet = new Set(acceptedIds);
                this.selectedClientLnIds = acceptedIds;
                this.clientLnTreePaths = paths.filter((path) => {
                    const id = this.clientLnIdForTreePath(path);
                    return id === null || acceptedIdSet.has(id);
                });
                return;
            }
            this.selectedClientLnIds = selectedIds;
            this.clientLnTreePaths = paths;
        });
    }
    render() {
        const reportControl = this.clientLnAssignmentReport;
        if (!reportControl) {
            return html `<oscd-dialog class="client-ln assignment dialog">
        <div slot="headline">Edit Clients</div>
      </oscd-dialog>`;
        }
        const logicalNodes = this.clientLogicalNodesForReport(reportControl);
        const tree = this.clientLnTreeData(logicalNodes, this.showSelectedClientLnsOnly);
        const rptEnabled = reportControl.querySelector(':scope > RptEnabled');
        const maxClients = parseInt(rptEnabled?.getAttribute('max') ?? '1', 10);
        const clientLimit = Number.isNaN(maxClients) ? 1 : maxClients;
        const selectedClientCount = this.selectedClientLnIds.length;
        const hasClientLnChanges = this.selectedClientLnIds.some(id => !this.initialClientLnIds.includes(id)) ||
            this.initialClientLnIds.some(id => !this.selectedClientLnIds.includes(id));
        return html `<oscd-dialog class="client-ln assignment dialog">
      <div slot="headline">
        <div class="client-ln-toolbar">
          <span>Assign Client LNs</span>
          <div>
            <span class="client-ln-count"
            >${selectedClientCount}/${clientLimit} clients</span
            >
            <oscd-outlined-icon-button
              class="show-selected-client-lns"
              @click=${() => {
            this.showSelectedClientLnsOnly = !this.showSelectedClientLnsOnly;
            this.clientLnTreePaths = this.selectedClientLnIds
                .map(id => this.clientLnTreePathForId(id))
                .filter((path) => path !== null);
        }}
            >
              <oscd-icon
              >${this.showSelectedClientLnsOnly
            ? 'filter_list_off'
            : 'filter_list'}</oscd-icon
              >
            </oscd-outlined-icon-button>
          </div>
        </div>

      </div>
      <div slot="content" class="client-ln-list">
        <oscd-tree-grid
          class="client-ln-tree"
          .filterLabel=${'Filter Client LNs'}
          .tree=${tree}
          .paths=${this.clientLnTreePaths}
          @click=${this.handleClientLnTreeClick}
        ></oscd-tree-grid>
      </div>
      <div slot="actions">
        <oscd-text-button
          @click=${() => {
            this.clientLnAssignmentDialog.close();
            this.clientLnAssignmentReport = undefined;
            this.selectedClientLnIds = [];
            this.initialClientLnIds = [];
            this.clientLnTreePaths = [];
            this.showSelectedClientLnsOnly = false;
        }}
          >Cancel</oscd-text-button
        >
        <oscd-filled-button
          ?disabled=${!hasClientLnChanges}
          @click=${() => this.updateSelectedClientLns()}
          >Apply</oscd-filled-button
        >
      </div>
    </oscd-dialog>
    `;
    }
    logicalNodeName(logicalNode) {
        return `${logicalNode.getAttribute('prefix') ?? ''}${logicalNode.getAttribute('lnClass')}${logicalNode.getAttribute('inst') ?? ''}`;
    }
}
ClientLnAssignmentDialog.scopedElements = {
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-text-button': OscdTextButton,
    'oscd-filled-button': OscdFilledButton,
    'oscd-icon-button': OscdIconButton,
    'oscd-icon': OscdIcon,
    'oscd-dialog': OscdDialog,
    'oscd-tree-grid': OscdTreeGrid,
    'oscd-outlined-icon-button': OscdOutlinedIconButton,
};
ClientLnAssignmentDialog.styles = css `

    oscd-dialog.client-ln.assignment.dialog {
      min-width: 640px;
      min-height: 520px;
    }

    .client-ln-list {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      min-width: 0;
      overflow: hidden;
    }

    .client-ln-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 8px;
      flex-grow: 1;
    }

    .client-ln-toolbar > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }

    .client-ln-count {
      font-size: 1rem;
    }

    .client-ln-tree {
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
    }

  `;
__decorate([
    property({ attribute: false })
], ClientLnAssignmentDialog.prototype, "doc", void 0);
__decorate([
    state()
], ClientLnAssignmentDialog.prototype, "clientLnAssignmentReport", void 0);
__decorate([
    state()
], ClientLnAssignmentDialog.prototype, "selectedClientLnIds", void 0);
__decorate([
    state()
], ClientLnAssignmentDialog.prototype, "initialClientLnIds", void 0);
__decorate([
    state()
], ClientLnAssignmentDialog.prototype, "clientLnTreePaths", void 0);
__decorate([
    state()
], ClientLnAssignmentDialog.prototype, "showSelectedClientLnsOnly", void 0);
__decorate([
    query('.selectionlist')
], ClientLnAssignmentDialog.prototype, "selectionList", void 0);
__decorate([
    query('.client-ln.assignment.dialog')
], ClientLnAssignmentDialog.prototype, "clientLnAssignmentDialog", void 0);
__decorate([
    query('.client-ln-tree')
], ClientLnAssignmentDialog.prototype, "clientLnTreeGrid", void 0);
__decorate([
    query('.change.scl.element')
], ClientLnAssignmentDialog.prototype, "selectReportControlButton", void 0);
__decorate([
    query('report-control-element-editor')
], ClientLnAssignmentDialog.prototype, "rpControlElementEditor", void 0);
__decorate([
    query('data-set-element-editor')
], ClientLnAssignmentDialog.prototype, "dataSetElementEditor", void 0);
//# sourceMappingURL=clientln-assignment-dialog.js.map
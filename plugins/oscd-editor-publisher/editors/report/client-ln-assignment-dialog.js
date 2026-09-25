import { __decorate } from "tslib";
import { css, html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdOutlinedIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdOutlinedIconButton.js';
import { OscdOutlinedTextField } from '@omicronenergy/oscd-ui/textfield/OscdOutlinedTextField.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';
import { OscdTree } from '@omicronenergy/oscd-ui/tree/OscdTree.js';
import { OscdTreeItem } from '@omicronenergy/oscd-ui/tree/OscdTreeItem.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import { getReference, identity } from '@openscd/scl-lib';
import { createElement } from '@openscd/scl-lib/dist/foundation/utils.js';
export class ClientLnAssignmentDialog extends ScopedElementsMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.selectedClientLnIds = [];
        this.initialClientLnIds = [];
        this.expandedClientLnNodeIds = [];
        this.clientLnFilter = '';
        this.showSelectedClientLnsOnly = false;
        this.isClientLnSelectable = (node) => {
            return node.kind === 'logical-node';
        };
        this.isClientLnDisabled = (node) => {
            const reportControl = this.clientLnAssignmentReport;
            if (!reportControl || !this.isClientLnSelectable(node)) {
                return false;
            }
            return (this.selectedClientLnIds.length >= this.maxClientLimit(reportControl) &&
                !this.selectedClientLnIds.includes(node.id));
        };
        this.renderClientLnTreeItem = ({ node, selected, active, disabled, }) => html `
    <oscd-tree-item
      ?selected=${selected}
      ?active=${active}
      ?disabled=${disabled}
    >
      <oscd-icon slot="start">${this.clientLnNodeIcon(node)}</oscd-icon>
      <span slot="headline">${node.label}</span>
      <span slot="supporting-text">${node.supportingText}</span>
    </oscd-tree-item>
  `;
    }
    get allClientLogicalNodes() {
        return Array.from(this.doc.querySelectorAll(':root > IED > AccessPoint > LN, :root > IED > AccessPoint > Server > LDevice > LN, :root > IED > AccessPoint > Server > LDevice > LN0'));
    }
    async open(reportControl) {
        this.clientLnAssignmentReport = reportControl;
        this.selectedClientLnIds = this.assignedClientLogicalNodes(reportControl).map(logicalNode => this.clientLnId(logicalNode));
        this.initialClientLnIds = [...this.selectedClientLnIds];
        this.expandedClientLnNodeIds = this.expandedNodeIdsForClientLnIds(this.selectedClientLnIds);
        this.showSelectedClientLnsOnly = false;
        this.clientLnFilter = '';
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
    getOrCreateTreeNode(siblings, node) {
        let existing = siblings.find(candidate => candidate.id === node.id);
        if (!existing) {
            existing = { ...node, children: [] };
            siblings.push(existing);
        }
        return existing;
    }
    matchesClientLnFilter(logicalNode) {
        const filter = this.clientLnFilter.trim().toLowerCase();
        if (!filter) {
            return true;
        }
        const iedName = logicalNode.closest('IED')?.getAttribute('name') ?? '';
        const apName = logicalNode.closest('AccessPoint')?.getAttribute('name') ?? '';
        const ldInst = logicalNode.closest('LDevice')?.getAttribute('inst') ?? 'LD0';
        const logicalNodeName = this.logicalNodeName(logicalNode);
        return [iedName, apName, ldInst, logicalNodeName, this.clientLnId(logicalNode)]
            .some(term => term.toLowerCase().includes(filter));
    }
    clientLnTreeData(logicalNodes) {
        const selectedIds = new Set(this.selectedClientLnIds);
        const tree = [];
        logicalNodes
            .filter(logicalNode => (!this.showSelectedClientLnsOnly ||
            selectedIds.has(this.clientLnId(logicalNode))) &&
            this.matchesClientLnFilter(logicalNode))
            .forEach((logicalNode) => {
            const iedName = logicalNode.closest('IED')?.getAttribute('name') ?? '';
            const apName = logicalNode.closest('AccessPoint')?.getAttribute('name') ?? '';
            const lDevice = logicalNode.closest('LDevice');
            const iedNode = this.getOrCreateTreeNode(tree, {
                id: `IED:${iedName}`,
                label: iedName,
                kind: 'ied',
            });
            const apNode = this.getOrCreateTreeNode(iedNode.children, {
                id: `IED:${iedName}|AP:${apName}`,
                label: apName,
                supportingText: iedName,
                kind: 'access-point',
            });
            let parent = apNode;
            if (lDevice) {
                const ldInst = lDevice.getAttribute('inst') ?? '';
                parent = this.getOrCreateTreeNode(apNode.children, {
                    id: `IED:${iedName}|AP:${apName}|LD:${ldInst}`,
                    label: ldInst,
                    supportingText: `${iedName} / ${apName}`,
                    kind: 'l-device',
                });
            }
            const logicalNodeId = this.clientLnId(logicalNode);
            this.getOrCreateTreeNode(parent.children, {
                id: logicalNodeId,
                label: this.logicalNodeName(logicalNode),
                supportingText: this.clientLnPathLabel(logicalNode),
                kind: 'logical-node',
                logicalNode,
            });
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
        this.expandedClientLnNodeIds = [];
        this.showSelectedClientLnsOnly = false;
        this.clientLnFilter = '';
    }
    expandedNodeIdsForClientLnIds(clientLnIds) {
        const expandedIds = new Set();
        clientLnIds.forEach((id) => {
            const path = this.clientLnTreePathForId(id);
            if (!path) {
                return;
            }
            path.slice(0, -1).forEach((segment, index) => {
                if (index === 0) {
                    expandedIds.add(segment);
                }
                else if (index === 1) {
                    expandedIds.add(`${path[0]}|${segment}`);
                }
                else if (index === 2) {
                    expandedIds.add(`${path[0]}|${path[1]}|${segment}`);
                }
            });
        });
        return [...expandedIds];
    }
    clientLnPathLabel(logicalNode) {
        const iedName = logicalNode.closest('IED')?.getAttribute('name') ?? '';
        const apName = logicalNode.closest('AccessPoint')?.getAttribute('name') ?? '';
        const ldInst = logicalNode.closest('LDevice')?.getAttribute('inst') ?? 'LD0';
        return `${iedName} / ${apName} / ${ldInst}`;
    }
    maxClientLimit(reportControl) {
        const rptEnabled = reportControl.querySelector(':scope > RptEnabled');
        const maxClients = parseInt(rptEnabled?.getAttribute('max') ?? '1', 10);
        return Number.isNaN(maxClients) ? 1 : maxClients;
    }
    handleSelectedClientLnIdsChanged(event) {
        this.selectedClientLnIds = event.detail.selectedIds;
    }
    clientLnNodeIcon(node) {
        switch (node.kind) {
            case 'ied':
                return 'developer_board';
            case 'access-point':
                return 'lan';
            case 'l-device':
                return 'dns';
            case 'logical-node':
                return 'article';
            default:
                return 'article';
        }
    }
    render() {
        const reportControl = this.clientLnAssignmentReport;
        if (!reportControl) {
            return html `<oscd-dialog class="client-ln assignment dialog">
        <div slot="headline">Edit Clients</div>
      </oscd-dialog>`;
        }
        const logicalNodes = this.clientLogicalNodesForReport(reportControl);
        const tree = this.clientLnTreeData(logicalNodes);
        const clientLimit = this.maxClientLimit(reportControl);
        const selectedClientCount = this.selectedClientLnIds.length;
        const selectedOnlyToggleLabel = this.showSelectedClientLnsOnly
            ? 'Show all Client LNs'
            : 'Show selected Client LNs';
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
              title=${selectedOnlyToggleLabel}
              aria-label=${selectedOnlyToggleLabel}
              @click=${() => {
            this.showSelectedClientLnsOnly = !this.showSelectedClientLnsOnly;
            if (this.showSelectedClientLnsOnly) {
                this.expandedClientLnNodeIds =
                    this.expandedNodeIdsForClientLnIds(this.selectedClientLnIds);
            }
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
        <oscd-outlined-text-field
          class="client-ln-filter"
          placeholder="Filter Client LNs"
          iconTrailing="search"
          .value=${this.clientLnFilter}
          @input=${(event) => {
            this.clientLnFilter = event.target.value;
        }}
        ></oscd-outlined-text-field>
        <oscd-tree
          class="client-ln-tree"
          selectionMode="multiple"
          .data=${tree}
          .selectedIds=${this.selectedClientLnIds}
          .expandedIds=${this.expandedClientLnNodeIds}
          .renderItem=${this.renderClientLnTreeItem}
          .isSelectable=${this.isClientLnSelectable}
          .isDisabled=${this.isClientLnDisabled}
          .getNodeLabel=${(node) => `${node.label}${node.supportingText ? ` ${node.supportingText}` : ''}`}
          @selected-ids-changed=${this.handleSelectedClientLnIdsChanged}
          @expanded-ids-changed=${(event) => {
            this.expandedClientLnNodeIds = event.detail.expandedIds;
        }}
        ></oscd-tree>
      </div>
      <div slot="actions">
        <oscd-text-button
          @click=${() => {
            this.clientLnAssignmentDialog.close();
            this.clientLnAssignmentReport = undefined;
            this.selectedClientLnIds = [];
            this.initialClientLnIds = [];
            this.expandedClientLnNodeIds = [];
            this.showSelectedClientLnsOnly = false;
            this.clientLnFilter = '';
        }}
          >Cancel</oscd-text-button
        >
        <oscd-filled-button
          ?disabled=${!hasClientLnChanges}
          @click=${() => this.updateSelectedClientLns()}
          >Apply</oscd-filled-button
        >
      </div>
    </oscd-dialog>`;
    }
    logicalNodeName(logicalNode) {
        return `${logicalNode.getAttribute('prefix') ?? ''}${logicalNode.getAttribute('lnClass')}${logicalNode.getAttribute('inst') ?? ''}`;
    }
}
ClientLnAssignmentDialog.scopedElements = {
    'oscd-text-button': OscdTextButton,
    'oscd-filled-button': OscdFilledButton,
    'oscd-icon': OscdIcon,
    'oscd-dialog': OscdDialog,
    'oscd-outlined-text-field': OscdOutlinedTextField,
    'oscd-outlined-icon-button': OscdOutlinedIconButton,
    'oscd-tree': OscdTree,
    'oscd-tree-item': OscdTreeItem,
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
], ClientLnAssignmentDialog.prototype, "expandedClientLnNodeIds", void 0);
__decorate([
    state()
], ClientLnAssignmentDialog.prototype, "clientLnFilter", void 0);
__decorate([
    state()
], ClientLnAssignmentDialog.prototype, "showSelectedClientLnsOnly", void 0);
__decorate([
    query('.client-ln.assignment.dialog')
], ClientLnAssignmentDialog.prototype, "clientLnAssignmentDialog", void 0);
__decorate([
    query('.client-ln-tree')
], ClientLnAssignmentDialog.prototype, "clientLnTree", void 0);
//# sourceMappingURL=client-ln-assignment-dialog.js.map
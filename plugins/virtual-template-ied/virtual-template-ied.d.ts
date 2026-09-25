import { LitElement, TemplateResult } from 'lit-element';
import { Dialog } from '@material/mwc-dialog';
import '@material/mwc-list/mwc-list-item';
import { CheckListItem } from '@material/mwc-list/mwc-check-list-item';
import '@material/mwc-list/mwc-radio-list-item';
import '@openscd/oscd-textfield';
import '@openscd/oscd-filtered-list';
export type FunctionElementDescription = {
    uniqueName: string;
    lNodes: Element[];
    lln0?: Element;
};
/**
 * @summary IED generation menu plugin for CoMPAS Open SCD (next)
 * @tag virtual-template-ied
 */
export default class VirtualTemplateIED extends LitElement {
    /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
    doc: XMLDocument;
    /** The editCount represents the current position in the edit history. */
    editCount: number;
    /** @ignore Returns true if the manufacturer input contains value. */
    get isValidManufacturer(): boolean;
    /** @ignore Returns true if the access point input contains value. */
    get isValidApName(): boolean;
    /** @ignore Returns true if an LNode is selected in the list. */
    get someItemsSelected(): boolean;
    /** @ignore Returns true if manufacturer and access point fields contain value and if atleast 1 LNode is selected in the list. */
    get validPrimaryAction(): boolean;
    /** @ignore Returns an array of Logical Nodes that have no reference to a IED and can therfore be used for the virtual IED. */
    get unreferencedLNodes(): Element[];
    /** @ignore Returns an array of LLN0 Logical Nodes. */
    get lLN0s(): Element[];
    /** @ignore The dialog in which the user can create a virtual template IED. */
    dialog: Dialog;
    /** @ignore A list of LNode items that are selected. */
    selectedLNodeItems?: CheckListItem[];
    /** Run method to start the plugin. */
    run(): Promise<void>;
    private onPrimaryAction;
    private onClosed;
    private renderLLN0s;
    private renderLNodes;
    render(): TemplateResult;
    static styles: import("lit-element").CSSResult;
}

/**
 * Some element Function, SubFunction, EqFunction or EqSubFunction.
 * Returns whether the element is a leaf function acc. to IEC 61850-6-100
 * */
export declare function isLeafFunction(element: Element | null): boolean;
/** Returns closest non-leaf function type parent element */
export declare function getNonLeafParent(element: Element | null): Element | null;
/** Returns prefix of LNode element acc. to IEC 61850-6-100 */
export declare function getFunctionNamingPrefix(lNode: Element): string;
/** Returns a unique name for the given element. If the name already exists the parents name will be added as a prefix. This happens recursively until the name is unique. */
export declare function getUniqueFunctionName(element: Element): string;
type AnyLNDescription = {
    lnClass: string;
    inst: string;
    prefix: string | null;
    lnType: string;
};
export type LDeviceDescription = {
    validLdInst: string;
    anyLNs: AnyLNDescription[];
};
export type VirtualIEDDescription = {
    manufacturer: string;
    desc: string | null;
    apName: string;
    lDevices: LDeviceDescription[];
};
/** Returns schema valid SPECIFICATION type IED based on virtualIED object  */
export declare function getSpecificationIED(ownerDocument: Document, virtualIED: VirtualIEDDescription): Element;
export {};

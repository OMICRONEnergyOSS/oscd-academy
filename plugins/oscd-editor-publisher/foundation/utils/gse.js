/** @returns a `GSE` element referenced to `GSEControl` element or `null` */
export function referencedGSE(gseControl) {
    const iedName = gseControl.closest('IED')?.getAttribute('name');
    const apName = gseControl.closest('AccessPoint')?.getAttribute('name');
    const ldInst = gseControl.closest('LDevice')?.getAttribute('inst');
    const cbName = gseControl.getAttribute('name');
    return gseControl.ownerDocument.querySelector(`Communication 
      > SubNetwork
      > ConnectedAP[iedName="${iedName}"][apName="${apName}"] 
      > GSE[ldInst="${ldInst}"][cbName="${cbName}"]`);
}
function pElementContent(gse, type) {
    return (Array.from(gse.querySelectorAll(':scope > Address > P'))
        .find(p => p.getAttribute('type') === type)
        ?.textContent?.trim() ?? null);
}
function pElement(smv, type) {
    return (Array.from(smv.querySelectorAll(':scope > Address > P')).find(p => p.getAttribute('type') === type) ?? null);
}
/** @returns Whether the `gSE`s element attributes or instType has changed */
export function checkGSEDiff(gSE, attrs, instType) {
    const valueDiff = Object.entries(attrs).some(([key, value]) => {
        if (key === 'MinTime' || key === 'MaxTime') {
            const oldValue = gSE.querySelector(`:scope > ${key}`)?.textContent?.trim() ?? null;
            return oldValue !== value;
        }
        const oldValue = pElementContent(gSE, key);
        return oldValue !== value;
    });
    if (valueDiff) {
        return valueDiff;
    }
    const instTypeDiff = Object.keys(attrs).some((key) => {
        const pType = pElement(gSE, key);
        if (!pType) {
            return false;
        }
        const hasInstType = pType.hasAttribute('xsi:type');
        return hasInstType !== !!instType;
    });
    return instTypeDiff;
}
//# sourceMappingURL=gse.js.map
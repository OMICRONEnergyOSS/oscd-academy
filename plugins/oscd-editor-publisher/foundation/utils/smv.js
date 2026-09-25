function pElementContent(smv, type) {
    return (Array.from(smv.querySelectorAll(':scope > Address > P'))
        .find(p => p.getAttribute('type') === type)
        ?.textContent?.trim() ?? null);
}
function pElement(smv, type) {
    return (Array.from(smv.querySelectorAll(':scope > Address > P')).find(p => p.getAttribute('type') === type) ?? null);
}
/** @returns Whether the `sMV`s element attributes or instType has changed */
export function checkSMVDiff(sMV, attributes = { pTypes: {} }) {
    const pTypeDiff = Object.entries(attributes.pTypes).some(([key, value]) => pElementContent(sMV, key) !== value);
    if (pTypeDiff) {
        return true;
    }
    if (attributes.instType === undefined) {
        return false;
    }
    const instTypeDiff = Object.keys(attributes.pTypes).some((key) => {
        const pType = pElement(sMV, key);
        if (!pType) {
            return false;
        }
        const hasInstType = pType.hasAttribute('xsi:type');
        return hasInstType !== attributes.instType;
    });
    return instTypeDiff;
}
//# sourceMappingURL=smv.js.map
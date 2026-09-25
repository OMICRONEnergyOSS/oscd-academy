import { createElement } from '@openscd/scl-lib/dist/foundation/utils.js';
function findFcda(dataSet, attr) {
    return Array.from(dataSet.children).find(fcda => fcda.tagName === 'FCDA' &&
        fcda.getAttribute('ldInst') === attr.ldInst &&
        (fcda.getAttribute('prefix') ?? '') === attr.prefix &&
        (fcda.getAttribute('lnInst') ?? '') === attr.lnInst &&
        fcda.getAttribute('lnClass') === attr.lnClass &&
        fcda.getAttribute('doName') === attr.doName &&
        fcda.getAttribute('daName') === (attr.daName ?? null) &&
        fcda.getAttribute('fc') === attr.fc);
}
/** @returns Action array adding new `FCDA`s to parent [[`DataSet`]] */
export function addFCDAs(dataSet, paths) {
    const actions = [];
    for (const path of paths) {
        const anyLn = path.find(section => section.tagName === 'LN' || section.tagName === 'LN0');
        const lDevice = path.find(section => section.tagName === 'LDevice');
        const ldInst = lDevice?.getAttribute('inst');
        const prefix = anyLn?.getAttribute('prefix') ?? '';
        const lnClass = anyLn?.getAttribute('lnClass');
        const lnInst = anyLn?.getAttribute('inst') ?? '';
        if (!ldInst || !lnClass) {
            continue;
        }
        let doName = '';
        let daName = '';
        let fc = '';
        for (const ancestor of path) {
            if (!['DO', 'DA', 'SDO', 'BDA'].includes(ancestor.tagName)) {
                continue;
            }
            const name = ancestor.getAttribute('name');
            if (ancestor.tagName === 'DO') {
                doName = name;
            }
            if (ancestor.tagName === 'SDO') {
                doName = `${doName}.${name}`;
            }
            if (ancestor.tagName === 'DA') {
                daName = name;
                fc = ancestor.getAttribute('fc') ?? '';
            }
            if (ancestor.tagName === 'BDA') {
                daName = `${daName}.${name}`;
            }
        }
        if (!doName || !daName || !fc) {
            continue;
        }
        const fcdaAttrs = {
            ldInst,
            prefix,
            lnClass,
            ...(lnClass !== 'LLN0' && { lnInst }),
            doName,
            daName,
            fc,
        };
        if (findFcda(dataSet, fcdaAttrs)) {
            continue;
        }
        actions.push({
            parent: dataSet,
            node: createElement(dataSet.ownerDocument, 'FCDA', fcdaAttrs),
            reference: null,
        });
    }
    return actions;
}
/** @returns Action array adding new `FCDA`s to parent [[`DataSet`]] */
export function addFCDOs(dataSet, fcPaths) {
    const actions = [];
    for (const fcPath of fcPaths) {
        const anyLn = fcPath.path.find(section => section.tagName === 'LN' || section.tagName === 'LN0');
        const lDevice = fcPath.path.find(section => section.tagName === 'LDevice');
        const ldInst = lDevice?.getAttribute('inst');
        const prefix = anyLn?.getAttribute('prefix') ?? '';
        const lnClass = anyLn?.getAttribute('lnClass');
        const lnInst = anyLn?.getAttribute('inst') ?? '';
        if (!ldInst || !lnClass) {
            continue;
        }
        let doName = '';
        const { fc } = fcPath;
        for (const ancestor of fcPath.path) {
            if (!['DO', 'SDO'].includes(ancestor.tagName)) {
                continue;
            }
            const name = ancestor.getAttribute('name');
            if (ancestor.tagName === 'DO') {
                doName = name;
            }
            if (ancestor.tagName === 'SDO') {
                doName = `${doName}.${name}`;
            }
        }
        if (!doName) {
            continue;
        }
        const fcdaAttrs = {
            ldInst,
            prefix,
            lnClass,
            lnInst,
            doName,
            fc,
        };
        if (findFcda(dataSet, fcdaAttrs)) {
            continue;
        }
        actions.push({
            parent: dataSet,
            node: createElement(dataSet.ownerDocument, 'FCDA', fcdaAttrs),
            reference: null,
        });
    }
    return actions;
}
export function getFcdaInstDesc(fcda) {
    const [doName, daName] = ['doName', 'daName'].map(attr => fcda.getAttribute(attr));
    const ied = fcda.closest('IED');
    if (!ied) {
        return {};
    }
    const anyLn = Array.from(ied.querySelectorAll(`:scope > AccessPoint > Server > LDevice[inst="${fcda.getAttribute('ldInst')}"] > LN, :scope > AccessPoint > Server > LDevice[inst="${fcda.getAttribute('ldInst')}"] > LN0`)).find(lN => (lN.getAttribute('prefix') ?? '') ===
        (fcda.getAttribute('prefix') ?? '') &&
        lN.getAttribute('lnClass') === (fcda.getAttribute('lnClass') ?? '') &&
        (lN.getAttribute('inst') ?? '') === (fcda.getAttribute('lnInst') ?? ''));
    if (!anyLn) {
        return {};
    }
    let descs = {};
    const ldDesc = anyLn.closest('LDevice').getAttribute('desc');
    descs = { ...descs, ...(ldDesc && ldDesc !== '' && { LDevice: ldDesc }) };
    const lnDesc = anyLn.getAttribute('desc');
    descs = { ...descs, ...(lnDesc && lnDesc !== '' && { LN: lnDesc }) };
    const doNames = doName.split('.');
    const daNames = daName?.split('.');
    const doi = anyLn.querySelector(`:scope > DOI[name="${doNames[0]}"`);
    if (!doi) {
        return descs;
    }
    let doiDesc = doi?.getAttribute('desc');
    if (!doiDesc) {
        doiDesc =
            doi?.querySelector(':scope > DAI[name="d"] > Val')?.textContent ?? null;
    }
    descs = { ...descs, ...(doiDesc && doiDesc !== '' && { DOI: doiDesc }) };
    let previousDI = doi;
    const daAsSDI = daNames ? daNames.slice(0, daNames.length - 1) : [];
    doNames
        .concat(daAsSDI)
        .slice(1)
        .forEach((sdiName) => {
        const sdi = previousDI.querySelector(`:scope > SDI[name="${sdiName}"]`);
        if (sdi) {
            previousDI = sdi;
        }
        let sdiDesc = sdi?.getAttribute('desc');
        if (!sdiDesc) {
            sdiDesc =
                sdi?.querySelector(':scope > DAI[name="d"] > Val')?.textContent ??
                    null;
        }
        if (!('SDI' in descs)) {
            descs = {
                ...descs,
                ...(sdiDesc && sdiDesc !== '' && { SDI: [sdiDesc] }),
            };
        }
        else if (sdiDesc) {
            descs.SDI.push(sdiDesc);
        }
    });
    if (!daName || !daNames) {
        return descs;
    }
    // ix and array elements not supported
    const lastdaName = daNames?.slice(daNames.length - 1);
    const dai = previousDI.querySelector(`:scope > DAI[name="${lastdaName}"]`);
    if (!dai) {
        return descs;
    }
    const daiDesc = dai.getAttribute('desc');
    descs = { ...descs, ...(daiDesc && daiDesc !== '' && { DAI: daiDesc }) };
    return descs;
}
//# sourceMappingURL=foundation.js.map
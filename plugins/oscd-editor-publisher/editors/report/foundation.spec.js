import { expect } from '@open-wc/testing';
import { isInsert, isRemove, isSetAttributes, } from '@openscd/oscd-api/utils.js';
import { updateMaxClients } from './foundation.js';
function findElement(str, selector) {
    return new DOMParser()
        .parseFromString(str, 'application/xml')
        .querySelector(selector);
}
const missingRptControl = `
<ReportControl name="someName">
    <TrgOps dchg="true" dupd="false" period="true"/>
    <OptFields seqNum="true" timeStamp="false" reasonCode="true" dataRef="false" configRef="true" bufOvfl="false"/>
</ReportControl>`;
const existingRptControl = `
<ReportControl name="someName">
    <RptEnabled max="6" /> 
</ReportControl>`;
describe('ReportControl related functions', () => {
    describe('update max attribute on RptEnable', () => {
        it('add missing RptEnabled', () => {
            const reportControl = findElement(missingRptControl, 'ReportControl');
            const action = updateMaxClients(reportControl, '4');
            expect(action).to.satisfies(isInsert);
            expect(action.reference).to.be.null;
            expect(action.node.getAttribute('max')).to.equal('4');
        });
        it('do not change missing RptEnabled', () => {
            const reportControl = findElement(missingRptControl, 'ReportControl');
            const action = updateMaxClients(reportControl, null);
            expect(action).to.be.null;
        });
        it('removes existing RptEnabled', () => {
            const reportControl = findElement(existingRptControl, 'ReportControl');
            const action = updateMaxClients(reportControl, null);
            expect(action).to.satisfies(isRemove);
        });
        it('updated existing RptEnabled', () => {
            const reportControl = findElement(existingRptControl, 'ReportControl');
            const action = updateMaxClients(reportControl, '34');
            expect(action).to.satisfies(isSetAttributes);
            expect(action.attributes).to.deep.equal({ max: '34' });
        });
    });
});
//# sourceMappingURL=foundation.spec.js.map
import { __decorate } from "../../_snowpack/pkg/tslib.js";
import { LitElement, html, state, query, } from '../../_snowpack/pkg/lit-element.js';
import '../../openscd/src/wizard-dialog.js';
/**
 * Base class for plugins that manage their own dialogs directly
 * without depending on oscd-wizard
 */
export class DirectDialogMixin extends LitElement {
    constructor() {
        super(...arguments);
        /** FIFO queue of [[`Wizard`]]s to display. */
        this.workflow = [];
    }
    /**
     * Handles wizard events by adding or removing wizards from the workflow
     */
    onWizard(we) {
        const wizard = we.detail.wizard;
        if (wizard === null)
            this.workflow.shift();
        else if (we.detail.subwizard)
            this.workflow.unshift(wizard);
        else
            this.workflow.push(wizard);
        this.requestUpdate('workflow');
        this.updateComplete.then(() => this.wizardUI?.updateComplete.then(() => this.wizardUI?.dialog?.updateComplete.then(() => this.wizardUI?.dialog?.focus())));
    }
    /**
     * Add event listeners for wizard events and editor actions
     */
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('wizard', this.onWizard.bind(this));
        this.addEventListener('editor-action', () => this.wizardUI?.requestUpdate());
    }
    /**
     * Renders the wizard dialog component
     */
    renderWizardDialog() {
        return html `<wizard-dialog .wizard=${this.workflow[0]?.() ?? []}></wizard-dialog>`;
    }
}
__decorate([
    state()
], DirectDialogMixin.prototype, "workflow", void 0);
__decorate([
    query('wizard-dialog')
], DirectDialogMixin.prototype, "wizardUI", void 0);
//# sourceMappingURL=directDialogMixin.js.map
import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation, OnInit} from "@angular/core";
import {SystemService} from "../../../platform-providers/system.service";
import {SettingsService} from "../../../services/settings/settings.service";
import {StepModel} from "cwlts/models";
import {ModalService} from "../../../ui/modal/modal.service";
import "rxjs/add/operator/first";

@Component({
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "ct-project-selection-modal",
    template: `
        <div>
            <form (ngSubmit)="onSubmit()" class="flex-form">

                <div class="modal-body">
                    <p>
                        You are currently using <a href="" (click)="$event.preventDefault(); system.openLink(link)">
                        {{step.label}}</a> (Revision {{step.run.customProps['sbg:latestRevision']}})
                        which has a new update available.
                        <br>
                        Do you want to update this node?
                    </p>

                    <div class="alert alert-info" *ngIf="updatedModel['sbg:revisionNotes']">
                        <p><strong>Revision note:</strong></p>
                        <p>"{{ updatedModel['sbg:revisionNotes']}}"</p>
                        <p class="text-muted small">by {{ updatedModel['sbg:modifiedBy'] }}
                            on {{ updatedModel['sbg:modifiedOn'] * 1000 | date: 'MMM d, y hh:mm'}}</p>
                    </div>

                    <div class="alert alert-danger" *ngIf="!updatedModel">
                        Failed to retrieve the latest revision of this app.
                    </div>

                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary btn-sm" type="button" (click)="onCancel()">Cancel</button>
                    <button class="btn btn-primary btn-sm" type="submit">
                        Update
                    </button>
                </div>
            </form>
        </div>
    `
})
export class UpdateStepModalComponent implements OnInit {

    @Input()
    step: StepModel;

    @Input()
    updatedModel: any;

    @Input()
    confirm: () => void;

    link;

    constructor(private modal: ModalService,
                public system: SystemService,
                private settings: SettingsService) {
    }

    ngOnInit() {

        const urlApp     = this.step.run.customProps["sbg:id"];
        const urlProject = urlApp.split("/").splice(0, 2).join("/");

        this.settings.platformConfiguration.first().map(settings => settings.url).subscribe((url) => {
            this.link = `${url}/u/${urlProject}/apps/#${urlApp}`;
        });
    }

    onSubmit() {
        this.confirm();
    }

    onCancel() {
        this.modal.close();
    }

    closeModal() {
        this.modal.close();
    }
}

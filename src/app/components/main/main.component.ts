import {Component, ViewContainerRef, ViewEncapsulation} from "@angular/core";
import {Observable} from "rxjs/Rx";
import {OldAuthService} from "../../auth/auth/auth.service";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {SystemService} from "../../platform-providers/system.service";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {GuidService} from "../../services/guid.service";
import {ContextService} from "../../ui/context/context.service";
import {MarkdownService} from "../../ui/markdown/markdown.service";
import {ModalService} from "../../ui/modal/modal.service";
import {UrlValidator} from "../../validators/url.validator";
import {JavascriptEvalService} from "../../services/javascript-eval/javascript-eval.service";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-cottontail",
    template: `
        <ct-layout></ct-layout>
        <div id="runnix" [class.active]="runnix | async"></div>

        <span data-marker="ready">ready</span>
    `,
    styleUrls: ["./../../../assets/sass/main.scss", "./main.component.scss"],
    providers: [
        UrlValidator,
        PlatformAPI,
        MarkdownService,
        ContextService,
        StatusBarService,
        // FIXME: this needs to be handled in a system-specific way
        GuidService
    ],
})
export class MainComponent {

    public runnix: Observable<boolean>;

    constructor(modal: ModalService,
                system: SystemService,
                vcRef: ViewContainerRef,
                auth: OldAuthService,
                js: JavascriptEvalService) {

        system.boot();

        auth.watchCredentials();

        /**
         * Hack for angular's inability to provide the vcRef to a service with DI.
         * {@link ModalService.rootViewRef}
         */
        modal.setViewContainer(vcRef);

        this.runnix = Observable.fromEvent(document, "keyup").map((e: KeyboardEvent) => e.keyCode).bufferCount(10, 1)
            .filter(seq => seq.toString() === [38, 38, 40, 40, 37, 39, 37, 39, 66, 65].toString())
            .map(seq => Observable.of(true).concat(Observable.of(false).delay(3000)))
            .concatAll();
    }
}

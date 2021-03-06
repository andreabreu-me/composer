import {ChangeDetectorRef, Injectable} from "@angular/core";
import * as YAML from "js-yaml";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {FileRepositoryService} from "../../../file-repository/file-repository.service";
import {ErrorNotification, NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {MenuItem} from "../../../ui/menu/menu-item";
import {TreeNode} from "../../../ui/tree-view/tree-node";
import {AppHelper} from "../../helpers/AppHelper";
import {ErrorWrapper} from "../../helpers/error-wrapper";
import {TabData} from "../../workbox/tab-data.interface";
import {WorkboxService} from "../../workbox/workbox.service";

const {dialog} = window["require"]("electron").remote;

@Injectable()
export class AppsPanelService {

    constructor(protected fileRepository: FileRepositoryService,
                protected platformRepository: PlatformRepositoryService,
                protected notificationBar: NotificationBarService,
                protected workbox: WorkboxService,
                protected statusBar: StatusBarService,
                protected cdr: ChangeDetectorRef) {
    }

    makeCopyAppToLocalMenuItem(node: TreeNode<any>): MenuItem {

        return new MenuItem("Copy to Local", {
            click: () => {

                const nodeID = node.label || node.id;
                dialog.showSaveDialog({
                    title: "Choose a File Path",
                    buttonLabel: "Save",
                    defaultPath: `${nodeID}.cwl`,
                    properties: ["openDirectory"]
                }, (path) => {

                    if (path) {

                        const savingUpdate  = new Subject();
                        const savingProcess = new Observable(subscriber => {
                            subscriber.next("Fetching " + node.id);

                            savingUpdate.filter(v => v === "loaded").take(1).subscribe(() => subscriber.next("Saving to " + path));
                            savingUpdate.filter(v => v === "saved").take(1).subscribe(() => {
                                subscriber.next(`Saved ${node.id} to ${path}`);
                                subscriber.complete();
                            });
                            savingUpdate.filter(v => v === "failed").take(1).subscribe(() => {
                                subscriber.next("Saving failed");
                                subscriber.complete();
                            })
                        }) as Observable<string>;

                        this.statusBar.enqueue(savingProcess);
                        let appType;

                        this.platformRepository.getApp(node.id).then(app => {
                            savingUpdate.next("loaded");
                            appType = app.class;
                            return YAML.dump(app);
                        }).then(text => {
                            return this.fileRepository.saveFile(path, text);
                        }).then(saved => {
                            savingUpdate.next("saved");

                            const tab = this.workbox.getOrCreateAppTab({
                                id: path,
                                language: "yaml",
                                isWritable: true,
                                label: AppHelper.getBasename(path),
                                type: appType,
                            } as TabData<any>);

                            this.workbox.openTab(tab);
                            this.fileRepository.reloadPath(path);

                            this.cdr.markForCheck();
                            this.cdr.detectChanges();

                        }).catch((err) => {
                            savingUpdate.next("failed");
                            this.notificationBar.showNotification(
                                new ErrorNotification("App saving failed. " + new ErrorWrapper(err))
                            );
                        });

                    }
                });
            }
        })
    }

}

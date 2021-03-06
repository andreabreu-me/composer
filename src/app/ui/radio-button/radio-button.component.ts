import {ChangeDetectionStrategy, Component, HostListener, Input, Output, ViewEncapsulation} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-radio-button",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./radio-button.component.scss"],
    host: {
        "class": "ct-radio-button btn"
    },
    template: `
        <div class="icon"><i class="fa fa-2x fa-{{ icon }}"></i></div>
        <div class="name">{{ name }}</div>
    `
})
export class RadioButtonComponent<T> {
    @Input()
    public icon: string;

    @Input()
    public name: string;

    @Input()
    public value: T;

    @Output()
    public onClick: Observable<RadioButtonComponent<T>>;

    constructor() {
        this.icon = "";
        this.name = "";

        this.onClick = new Subject<RadioButtonComponent<T>>();
    }

    @HostListener("click")
    public onHostClick() {
        (this.onClick as Subject<RadioButtonComponent<T>>).next(this);
    }
}

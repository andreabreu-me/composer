import {Component, Input, OnInit, Output} from "@angular/core";
import {ExpressionModel} from "cwlts/models";
import {Subject} from "rxjs/Subject";

@Component({
    selector: "ct-model-expression-editor",
    template: `
        <ct-expression-editor [evaluator]="evaluator"
                              [context]="context"
                              (action)="action.next($event)"
                              [code]="code"
                              [readonly]="readonly">
        </ct-expression-editor>
    `
})
export class ModelExpressionEditorComponent implements OnInit {

    @Input()
    model: ExpressionModel;

    @Input()
    context: { $job?: any, $self?: any };

    @Input()
    readonly = false;

    @Output()
    action = new Subject<"close" | "save">();

    code: string;
    evaluator: (code: string) => Promise<string | { message: string; type: any; }>;

    ngOnInit() {
        this.code = this.model.getScript() || "";

        this.evaluator = (content: string) => {

            // this.model = new ExpressionModel(this.model.loc, this.model.serialize());
            this.model.setValue(content, "expression");

            return this.model.evaluate(this.context).then(res => {
                if (this.model.getScript() === "") {
                    return "There is no expression defined.";
                }

                return JSON.stringify(res, null, 4) || "undefined";
            }, err => {
                return {
                    message: err.message + " on " + err.loc,
                    type: err.type
                };
            });
        };
    }
}

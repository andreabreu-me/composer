import {Observable} from "rxjs/Observable";

export interface AppTabData {
    id: string;
    dataSource: "local" | "public" | "app";
    parsedContent: any;
    fileContent: Observable<string>;
    isWritable: boolean;
    resolve: (content: string) => Observable<string>;
    language: "json" | "yaml" | string;

}

// Types for the IA study harness, so the catalogue tests can guard findability.
export type StudyItem = {id:string;name:string;brand:string;keywords:string;aisleId:string;departmentId:string;alsoIn:string[]};
export type StudyAisle = {id:string;name:string;items:StudyItem[]};
export type StudyDepartment = {id:string;name:string;edible:boolean;aisles:StudyAisle[]};
export declare function loadTaxonomy(sourcePath?:string):StudyDepartment[];
export declare function treeTest(departments:StudyDepartment[],options?:{trialsPerItem?:number}):
 {item:StudyItem;person:string;concepts:number;deptCorrect:boolean;found:boolean;wentTo:string}[];
export declare function cardSort(departments:StudyDepartment[]):{aisle:string;size:number;agreement:number}[];
export declare function report(departments:StudyDepartment[]):
 {text:string;overall:number;deptRate:number;failures:unknown[];sort:unknown[];trials:number;coverage:number};

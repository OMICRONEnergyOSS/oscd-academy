type ChildDiff = {
    name: string;
    element?: Element;
    type?: Element;
    class?: string;
    children: ChildDiff[];
    different: boolean;
    diffType?: 'missing' | 'different';
};
type Diff = {
    dos: ChildDiff[];
    different: boolean;
};
export declare function getDatType(data: Element): Element | null;
export declare function compareLNodeType(ours: Element, theirs: Element): Diff;
export {};

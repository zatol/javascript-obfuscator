import { inject, injectable, } from 'inversify';
import { ServiceIdentifiers } from '../../container/ServiceIdentifiers';

import * as ESTree from 'estree';

import { TIdentifierNamesGeneratorFactory } from '../../types/container/generators/TIdentifierNamesGeneratorFactory';
import { TStatement } from '../../types/node/TStatement';
import { TStringArrayIndexNodeFactory } from '../../types/container/custom-nodes/string-array-index-nodes/TStringArrayIndexNodeFactory';

import { ICustomCodeHelperFormatter } from '../../interfaces/custom-code-helpers/ICustomCodeHelperFormatter';
import { IOptions } from '../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../interfaces/utils/IRandomGenerator';

import { initializable } from '../../decorators/Initializable';

import { AbstractStringArrayCallNode } from './AbstractStringArrayCallNode';
import { NodeFactory } from '../../node/NodeFactory';
import { NodeUtils } from '../../node/NodeUtils';

@injectable()
export class StringArrayCallNode extends AbstractStringArrayCallNode {
    /**
     * @type {string | null}
     */
    @initializable()
    private decodeKey!: string | null;

    /**
     * @type {number}
     */
    @initializable()
    private index!: number;

    /**
     * @type {number}
     */
    @initializable()
    private indexShiftAmount!: number;

    /**
     * @type {string}
     */
    @initializable()
    private stringArrayCallsWrapperName!: string;

    /**
     * @param {TIdentifierNamesGeneratorFactory} identifierNamesGeneratorFactory
     * @param {TStringArrayIndexNodeFactory} stringArrayIndexNodeFactory
     * @param {ICustomCodeHelperFormatter} customCodeHelperFormatter
     * @param {IRandomGenerator} randomGenerator
     * @param {IOptions} options
     */
    public constructor (
        @inject(ServiceIdentifiers.Factory__IIdentifierNamesGenerator)
            identifierNamesGeneratorFactory: TIdentifierNamesGeneratorFactory,
        @inject(ServiceIdentifiers.Factory__IStringArrayIndexNode)
            stringArrayIndexNodeFactory: TStringArrayIndexNodeFactory,
        @inject(ServiceIdentifiers.ICustomCodeHelperFormatter) customCodeHelperFormatter: ICustomCodeHelperFormatter,
        @inject(ServiceIdentifiers.IRandomGenerator) randomGenerator: IRandomGenerator,
        @inject(ServiceIdentifiers.IOptions) options: IOptions
    ) {
        super(
            identifierNamesGeneratorFactory,
            stringArrayIndexNodeFactory,
            customCodeHelperFormatter,
            randomGenerator,
            options
        );
    }

    /**
     * @param {string} stringArrayCallsWrapperName
     * @param {number} index
     * @param {number} indexShiftAmount
     * @param {string | null} decodeKey
     */
    public initialize (
        stringArrayCallsWrapperName: string,
        index: number,
        indexShiftAmount: number,
        decodeKey: string | null
    ): void {
        this.stringArrayCallsWrapperName = stringArrayCallsWrapperName;
        this.index = index;
        this.indexShiftAmount = indexShiftAmount;
        this.decodeKey = decodeKey;
    }

    /**
     * @returns {TStatement[]}
     */
    protected getNodeStructure (): TStatement[] {
        const callExpressionArgs: ESTree.Expression[] = [
            this.getStringArrayIndexNode(this.indexShiftAmount + this.index)
        ];

        if (this.decodeKey) {
            callExpressionArgs.push(this.getRc4KeyLiteralNode(this.decodeKey));
        }

        const stringArrayIdentifierNode: ESTree.Identifier =
            NodeFactory.identifierNode(this.stringArrayCallsWrapperName);


        const structure: TStatement = NodeFactory.expressionStatementNode(
            NodeFactory.callExpressionNode(
                stringArrayIdentifierNode,
                callExpressionArgs
            )
        );

        NodeUtils.parentizeAst(structure);

        return [structure];
    }
}

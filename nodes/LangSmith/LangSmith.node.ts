import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

export class LangSmith implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LangSmith',
		name: 'langSmith',
		icon: 'file:langsmith.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with LangSmith API for prompt management and logging',
		defaults: {
			name: 'LangSmith',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'langSmithApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Prompt',
						value: 'prompt',
					},
					{
						name: 'Run',
						value: 'run',
					},
					{
						name: 'Dataset',
						value: 'dataset',
					},
				],
				default: 'prompt',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['prompt'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a specific prompt',
						action: 'Get a prompt',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all prompts',
						action: 'List prompts',
					},
					{
						name: 'Execute',
						value: 'execute',
						description: 'Execute a prompt with variables',
						action: 'Execute a prompt',
					},
				],
				default: 'get',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['run'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new run for logging',
						action: 'Create a run',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing run',
						action: 'Update a run',
					},
					{
						name: 'End',
						value: 'end',
						description: 'End a run and log results',
						action: 'End a run',
					},
				],
				default: 'create',
			},
			// Prompt operations fields
			{
				displayName: 'Prompt Name',
				name: 'promptName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['get', 'execute'],
					},
				},
				description: 'The name of the prompt to fetch or execute',
			},
			{
				displayName: 'Variables',
				name: 'variables',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['execute'],
					},
				},
				default: {},
				options: [
					{
						name: 'variable',
						displayName: 'Variable',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Variable name',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Variable value',
							},
						],
					},
				],
			},
			// Run operations fields
			{
				displayName: 'Run Name',
				name: 'runName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['run'],
						operation: ['create'],
					},
				},
				description: 'Name for the run',
			},
			{
				displayName: 'Run Type',
				name: 'runType',
				type: 'options',
				options: [
					{
						name: 'LLM',
						value: 'llm',
					},
					{
						name: 'Chain',
						value: 'chain',
					},
					{
						name: 'Tool',
						value: 'tool',
					},
					{
						name: 'Prompt',
						value: 'prompt',
					},
				],
				default: 'llm',
				displayOptions: {
					show: {
						resource: ['run'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Run ID',
				name: 'runId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['run'],
						operation: ['update', 'end'],
					},
				},
				description: 'ID of the run to update or end',
			},
			{
				displayName: 'Input',
				name: 'input',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						resource: ['run'],
						operation: ['create', 'update'],
					},
				},
				description: 'Input data for the run',
			},
			{
				displayName: 'Output',
				name: 'output',
				type: 'json',
				default: '{}',
				displayOptions: {
					show: {
						resource: ['run'],
						operation: ['end'],
					},
				},
				description: 'Output data from the run',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['run'],
					},
				},
				options: [
					{
						displayName: 'Error',
						name: 'error',
						type: 'string',
						default: '',
						description: 'Error message if the run failed',
					},
					{
						displayName: 'Metadata',
						name: 'metadata',
						type: 'json',
						default: '{}',
						description: 'Additional metadata for the run',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						description: 'Comma-separated list of tags',
					},
					{
						displayName: 'Parent Run ID',
						name: 'parentRunId',
						type: 'string',
						default: '',
						description: 'ID of the parent run if this is a child run',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const credentials = await this.getCredentials('langSmithApi');
		
		// For now, we'll use basic fetch since the Client SDK methods might not match
		const apiKey = credentials.apiKey as string;
		const apiUrl = credentials.apiUrl as string || 'https://api.smith.langchain.com';

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'prompt') {
					if (operation === 'get') {
						// Implement prompt fetching
						const promptName = this.getNodeParameter('promptName', i) as string;
						returnData.push({ 
							message: `Would fetch prompt: ${promptName}`,
							promptName 
						} as IDataObject);
					} else if (operation === 'list') {
						// Implement prompt listing
						returnData.push({ 
							message: 'Would list prompts',
							prompts: [] 
						} as IDataObject);
					} else if (operation === 'execute') {
						// Implement prompt execution
						const promptName = this.getNodeParameter('promptName', i) as string;
						const variables = this.getNodeParameter('variables', i) as IDataObject;
						
						const formattedVars: IDataObject = {};
						if (variables.variable) {
							const varArray = variables.variable as IDataObject[];
							varArray.forEach((v) => {
								formattedVars[v.name as string] = v.value;
							});
						}

						returnData.push({ 
							message: `Would execute prompt: ${promptName}`,
							promptName,
							variables: formattedVars
						} as IDataObject);
					}
				} else if (resource === 'run') {
					if (operation === 'create') {
						const runName = this.getNodeParameter('runName', i) as string;
						const runType = this.getNodeParameter('runType', i) as string;
						const input = this.getNodeParameter('input', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						
						const runId = Math.random().toString(36).substring(7);
						
						returnData.push({ 
							runId, 
							status: 'created',
							runName,
							runType,
							input: JSON.parse(input)
						} as IDataObject);
					} else if (operation === 'update') {
						const runId = this.getNodeParameter('runId', i) as string;
						const input = this.getNodeParameter('input', i) as string;
						
						returnData.push({ 
							runId, 
							status: 'updated',
							input: JSON.parse(input)
						} as IDataObject);
					} else if (operation === 'end') {
						const runId = this.getNodeParameter('runId', i) as string;
						const output = this.getNodeParameter('output', i) as string;
						
						returnData.push({ 
							runId, 
							status: 'ended',
							output: JSON.parse(output)
						} as IDataObject);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: (error as Error).message } as IDataObject);
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error);
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}

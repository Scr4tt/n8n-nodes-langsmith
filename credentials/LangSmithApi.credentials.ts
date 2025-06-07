import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class LangSmithApi implements ICredentialType {
	name = 'langSmithApi';
	displayName = 'LangSmith API';
	documentationUrl = 'https://docs.langchain.com/langsmith';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your LangSmith API key',
		},
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: 'https://api.smith.langchain.com',
			description: 'The LangSmith API URL (default: https://api.smith.langchain.com)',
		},
	];
}

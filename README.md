# n8n-nodes-langsmith

This is an n8n community node that provides integration with [LangSmith](https://langsmith.langchain.com/), allowing you to manage prompts, create runs, and log AI agent results directly from your n8n workflows.

## Features

- **Prompt Management**
  - Fetch specific prompts from LangSmith
  - List all available prompts
  - Execute prompts with custom variables

- **Run Tracking**
  - Create new runs for logging AI agent executions
  - Update runs with intermediate results
  - End runs and log final outputs
  - Support for metadata, tags, and error tracking
  - Parent-child run relationships for complex workflows

- **Integration with n8n AI Nodes**
  - Seamlessly integrate with n8n's AI agent nodes
  - Log prompt-level results and performance metrics
  - Track AI workflow execution chains

## Installation

### Community Node Installation

1. In n8n, go to **Settings** > **Community Nodes**
2. Select **Install a community node**
3. Enter `n8n-nodes-langsmith`
4. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes folder
cd ~/.n8n/nodes

# Clone this repository
git clone https://github.com/Scr4tt/n8n-nodes-langsmith.git

# Install dependencies
cd n8n-nodes-langsmith
npm install

# Build the node
npm run build

# Restart n8n
```

## Setup

1. Get your LangSmith API key from [LangSmith Settings](https://smith.langchain.com/settings)
2. In n8n, create new LangSmith credentials:
   - Go to **Credentials** > **New**
   - Select **LangSmith API**
   - Enter your API key
   - (Optional) Modify the API URL if using a self-hosted instance

## Usage Examples

### Example 1: Fetch and Execute a Prompt

```json
{
  "nodes": [
    {
      "name": "LangSmith - Get Prompt",
      "type": "n8n-nodes-langsmith.langSmith",
      "parameters": {
        "resource": "prompt",
        "operation": "get",
        "promptName": "customer-support-template"
      }
    },
    {
      "name": "LangSmith - Execute Prompt",
      "type": "n8n-nodes-langsmith.langSmith",
      "parameters": {
        "resource": "prompt",
        "operation": "execute",
        "promptName": "customer-support-template",
        "variables": {
          "variable": [
            {
              "name": "customer_name",
              "value": "{{ $json.customerName }}"
            },
            {
              "name": "issue",
              "value": "{{ $json.issue }}"
            }
          ]
        }
      }
    }
  ]
}
```

### Example 2: Log AI Agent Execution

```json
{
  "nodes": [
    {
      "name": "LangSmith - Start Run",
      "type": "n8n-nodes-langsmith.langSmith",
      "parameters": {
        "resource": "run",
        "operation": "create",
        "runName": "Customer Support Agent",
        "runType": "chain",
        "input": "{{ JSON.stringify($json) }}",
        "additionalFields": {
          "tags": "customer-support,production",
          "metadata": "{ \"version\": \"1.0\", \"model\": \"gpt-4\" }"
        }
      }
    },
    {
      "name": "AI Agent",
      "type": "n8n-nodes-base.agent",
      "parameters": {
        // Your AI agent configuration
      }
    },
    {
      "name": "LangSmith - End Run",
      "type": "n8n-nodes-langsmith.langSmith",
      "parameters": {
        "resource": "run",
        "operation": "end",
        "runId": "{{ $node['LangSmith - Start Run'].json.runId }}",
        "output": "{{ JSON.stringify($json) }}"
      }
    }
  ]
}
```

### Example 3: Complex Workflow with Parent-Child Runs

This example shows how to track a complex AI workflow with multiple steps:

```json
{
  "nodes": [
    {
      "name": "Parent Run",
      "type": "n8n-nodes-langsmith.langSmith",
      "parameters": {
        "resource": "run",
        "operation": "create",
        "runName": "Complex AI Workflow",
        "runType": "chain"
      }
    },
    {
      "name": "Child Run 1",
      "type": "n8n-nodes-langsmith.langSmith",
      "parameters": {
        "resource": "run",
        "operation": "create",
        "runName": "Data Preprocessing",
        "runType": "tool",
        "additionalFields": {
          "parentRunId": "{{ $node['Parent Run'].json.runId }}"
        }
      }
    },
    // ... more nodes for processing
  ]
}
```

## Node Reference

### Resources

#### Prompt Resource
- **Get**: Fetch a specific prompt by name
- **List**: List all available prompts
- **Execute**: Execute a prompt with provided variables

#### Run Resource
- **Create**: Start a new run for tracking
- **Update**: Update an existing run with new data
- **End**: Complete a run and log final results

### Parameters

#### Common Parameters
- **Prompt Name**: The name/ID of the prompt in LangSmith
- **Run ID**: Unique identifier for a run
- **Variables**: Key-value pairs for prompt template variables

#### Run-specific Parameters
- **Run Type**: Type of run (llm, chain, tool, prompt)
- **Input/Output**: JSON data for run inputs and outputs
- **Tags**: Comma-separated list of tags for categorization
- **Metadata**: Additional JSON metadata
- **Parent Run ID**: Link to parent run for nested tracking

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/Scr4tt/n8n-nodes-langsmith.git
cd n8n-nodes-langsmith

# Install dependencies
npm install

# Build the node
npm run build

# Run in development mode (watch for changes)
npm run dev
```

### Project Structure

```
n8n-nodes-langsmith/
├── nodes/
│   └── LangSmith/
│       ├── LangSmith.node.ts
│       └── langsmith.svg
├── credentials/
│   └── LangSmithApi.credentials.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Please report bugs and feature requests in the [GitHub Issues](https://github.com/Scr4tt/n8n-nodes-langsmith/issues)
- **Documentation**: [LangSmith Documentation](https://docs.langchain.com/langsmith)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- [n8n](https://n8n.io/) for the workflow automation platform
- [LangChain](https://langchain.com/) for LangSmith
- The n8n community for continuous support and feedback

import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Phone, MessageSquare, Mail, Search } from 'lucide-react';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'custom',
    data: { 
      label: 'Start',
      isStart: true 
    },
    position: { x: 250, y: 25 },
    style: {
      background: '#1F2937',
      color: 'white',
      border: '1px solid #4B5563',
      borderRadius: '8px',
      width: 150,
    },
  },
];

const initialEdges: Edge[] = [];

function CustomNode({ data }: any) {
  return (
    <div className={`p-4 rounded-lg border min-w-[150px] ${
      data.isStart 
        ? 'bg-gray-800 border-gray-600 shadow-lg' 
        : 'bg-gray-800 border-gray-700'
    }`}>
      {!data.isStart && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#4B5563' }}
        />
      )}
      <div className="flex items-center justify-center space-x-2">
        {data.icon && <data.icon className="h-5 w-5 text-white" />}
        <span className="text-white font-medium">{data.label}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#4B5563' }}
      />
    </div>
  );
}

const FlowDesigner: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      let newNode: Node = {
        id: `${type}-${nodes.length + 1}`,
        type: 'custom',
        position,
        data: { label: type },
      };

      switch (type) {
        case 'Call':
          newNode.data.icon = Phone;
          break;
        case 'SMS':
          newNode.data.icon = MessageSquare;
          break;
        case 'Email':
          newNode.data.icon = Mail;
          break;
        case 'Skiptrace':
          newNode.data.icon = Search;
          break;
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="relative h-[calc(100vh-12rem)] bg-gray-900 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 bg-gray-800 p-4 border-b border-gray-700 z-50">
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-move transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, 'Call')}
          >
            <Phone className="h-5 w-5" />
            <span>Call</span>
          </div>
          <div
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-move transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, 'SMS')}
          >
            <MessageSquare className="h-5 w-5" />
            <span>SMS</span>
          </div>
          <div
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-move transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, 'Email')}
          >
            <Mail className="h-5 w-5" />
            <span>Email</span>
          </div>
          <div
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-move transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, 'Skiptrace')}
          >
            <Search className="h-5 w-5" />
            <span>Skiptrace</span>
          </div>
        </div>
      </div>

      {/* Flow Designer */}
      <div className="h-full pt-16" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-900"
        >
          <Background color="#374151" gap={16} />
          <Controls className="bg-gray-800 border-gray-700" />
        </ReactFlow>
      </div>
    </div>
  );
};

export default FlowDesigner;
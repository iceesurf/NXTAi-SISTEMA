import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

export default function FlowEditor() {
  return (
    <div style={{ height: 500 }}>
      <ReactFlow nodes={[{ id: "1", position: {x:50,y:50}, data: {label:"Início"} }]} edges={[]} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

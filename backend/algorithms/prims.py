import sys
import json
import heapq

def prims_algorithm(nodes, edges):
    n = len(nodes)
    
    # Build adjacency list from edge format
    adj = [[] for _ in range(n)]
    for edge in edges:
        u, v, w = edge['from'], edge['to'], edge['weight']
        adj[u].append((v, w))
        adj[v].append((u, w))
    
    if n == 0:
        return 0, []
    
    visited = [False] * n
    min_heap = [(0, 0, -1)]  # (weight, node, parent)
    mst_weight = 0
    mst_edges = []
    
    while min_heap:
        weight, u, parent = heapq.heappop(min_heap)
        
        if visited[u]:
            continue
            
        visited[u] = True
        mst_weight += weight
        
        # Add edge to MST (except for the starting node)
        if parent != -1:
            mst_edges.append([parent, u])
        
        # Add adjacent nodes to heap
        for v, w in adj[u]:
            if not visited[v]:
                heapq.heappush(min_heap, (w, v, u))
    
    return mst_weight, mst_edges

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No input provided", "algorithm": "Prims"}))
            sys.exit(1)
            
        input_data = json.loads(sys.argv[1])
        nodes = input_data.get('nodes', [])
        edges = input_data.get('edges', [])
        
        if len(nodes) == 0:
            print(json.dumps({"error": "No nodes provided", "algorithm": "Prims"}))
            sys.exit(1)
        
        total_weight, mst_edges = prims_algorithm(nodes, edges)
        
        result = {
            "mstWeight": total_weight,
            "mst": mst_edges,
            "algorithm": "Prims",
            "nodeCount": len(nodes),
            "edgeCount": len(edges)
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": str(e),
            "algorithm": "Prims"
        }
        print(json.dumps(error_result))

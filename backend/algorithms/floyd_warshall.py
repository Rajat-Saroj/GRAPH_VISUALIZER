import json
import sys

def floyd_warshall(graph):
    nodes = list(graph.keys())
    n = len(nodes)
    index = {node: i for i, node in enumerate(nodes)}
    
    dist = [[float('inf')] * n for _ in range(n)]
    next_node = [[None] * n for _ in range(n)]

    for u in nodes:
        i = index[u]
        dist[i][i] = 0
        for v, w in graph[u]:
            j = index[v]
            dist[i][j] = w
            next_node[i][j] = j

    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    next_node[i][j] = next_node[i][k]

    return {
        "distance_matrix": [[dist[i][j] if dist[i][j] != float('inf') else None for j in range(n)] for i in range(n)],
        "nodes": nodes,
        "algorithm": "Floyd-Warshall"
    }

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.argv[1])
        nodes = input_data['nodes']
        edges = input_data['edges']
        
        # Build graph from edges (adjacency list format)
        graph = {node: [] for node in nodes}
        for edge in edges:
            graph[edge['from']].append((edge['to'], edge['weight']))
            graph[edge['to']].append((edge['from'], edge['weight']))
        
        result = floyd_warshall(graph)
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'algorithm': 'Floyd-Warshall'
        }
        print(json.dumps(error_result))

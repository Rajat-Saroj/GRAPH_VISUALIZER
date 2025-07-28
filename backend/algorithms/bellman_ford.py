import json
import sys

def bellman_ford(graph, start, end=None):
    distance = {node: float('inf') for node in graph}
    predecessor = {node: None for node in graph}
    distance[start] = 0

    for _ in range(len(graph) - 1):
        for u in graph:
            for v, w in graph[u]:
                if distance[u] + w < distance[v]:
                    distance[v] = distance[u] + w
                    predecessor[v] = u

    # Check for negative weight cycles
    for u in graph:
        for v, w in graph[u]:
            if distance[u] + w < distance[v]:
                return {"error": "Graph contains a negative weight cycle"}

    return {
        "distances": distance,
        "previous": predecessor,
        "algorithm": "Bellman-Ford",
        "source": start
    }

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.argv[1])
        nodes = input_data['nodes']
        edges = input_data['edges']
        source = input_data['source']
        
        # Build graph from edges (adjacency list format)
        graph = {node: [] for node in nodes}
        for edge in edges:
            graph[edge['from']].append((edge['to'], edge['weight']))
            graph[edge['to']].append((edge['from'], edge['weight']))  # For undirected graph
        
        result = bellman_ford(graph, source)
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'algorithm': 'Bellman-Ford'
        }
        print(json.dumps(error_result))

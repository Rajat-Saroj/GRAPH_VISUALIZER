import json
import sys
import heapq

def dijkstra(graph, start):
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    visited = set()
    pq = [(0, start)]
    previous = {}
    
    while pq:
        current_distance, current_node = heapq.heappop(pq)
        
        if current_node in visited:
            continue
            
        visited.add(current_node)
        
        if current_node in graph:
            for neighbor, weight in graph[current_node].items():
                distance = current_distance + weight
                
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    previous[neighbor] = current_node
                    heapq.heappush(pq, (distance, neighbor))
    
    return distances, previous

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No input provided", "algorithm": "Dijkstra"}))
            sys.exit(1)
            
        input_data = json.loads(sys.argv[1])
        nodes = input_data.get('nodes', [])
        edges = input_data.get('edges', [])
        source = input_data.get('source', 0)
        
        # Build graph from edges
        graph = {}
        for node in nodes:
            graph[node] = {}
            
        for edge in edges:
            from_node = edge['from']
            to_node = edge['to']
            weight = edge['weight']
            
            if from_node not in graph:
                graph[from_node] = {}
            if to_node not in graph:
                graph[to_node] = {}
                
            graph[from_node][to_node] = weight
            graph[to_node][from_node] = weight  # undirected
        
        distances, previous = dijkstra(graph, source)
        
        # Convert infinity values to null for JSON compatibility
        json_distances = {}
        for node, distance in distances.items():
            if distance == float('infinity'):
                json_distances[node] = None  # Use null instead of Infinity
            else:
                json_distances[node] = distance
        
        result = {
            'distances': json_distances,
            'previous': previous,
            'algorithm': 'Dijkstra',
            'source': source
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'algorithm': 'Dijkstra'
        }
        print(json.dumps(error_result))

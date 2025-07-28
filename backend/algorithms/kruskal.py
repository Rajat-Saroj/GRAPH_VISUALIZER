# kruskal.py

class DisjointSet:
    def __init__(self, vertices):
        self.parent = {v: v for v in vertices}
        self.rank = {v: 0 for v in vertices}

    def find(self, v):
        if self.parent[v] != v:
            self.parent[v] = self.find(self.parent[v])  # Path compression
        return self.parent[v]

    def union(self, u, v):
        root_u = self.find(u)
        root_v = self.find(v)

        if root_u == root_v:
            return False

        if self.rank[root_u] < self.rank[root_v]:
            self.parent[root_u] = root_v
        elif self.rank[root_u] > self.rank[root_v]:
            self.parent[root_v] = root_u
        else:
            self.parent[root_v] = root_u
            self.rank[root_u] += 1
        return True

def kruskal(nodes, edges):
    ds = DisjointSet(nodes)
    mst = []
    total_weight = 0

    edges.sort(key=lambda x: x[2])  # Sort by weight

    for u, v, w in edges:
        if ds.union(u, v):
            mst.append((u, v, w))
            total_weight += w

    return {
        "totalWeight": total_weight,
        "edges": mst
    }

# For testing independently
if __name__ == "__main__":
    nodes = ["A", "B", "C", "D"]
    edges = [
        ("A", "B", 1),
        ("B", "C", 3),
        ("C", "D", 4),
        ("A", "D", 2),
        ("B", "D", 5)
    ]
    print(kruskal(nodes, edges))

---
title: The Mental Model Behind Kubernetes Services
description: Pods are ephemeral. Services aren't. A practical way to think about stable networking in a cluster that never stops changing.
date: 2026-10-04
topic: Engineering
---

Pods come and go. Their IPs change every time they're rescheduled. So how does anything talk to anything else?

## The problem

If a frontend hard-codes a backend pod's IP, it breaks the moment that pod restarts. We need a **stable name** in front of an **unstable set** of pods.

## The abstraction

A Service selects pods by label and gives them one virtual IP and DNS name:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 8080
```

Now anything in the cluster can call `http://api` and kube-proxy routes the request to a healthy pod.

## Service types at a glance

| Type         | Reachable from     | Typical use           |
| ------------ | ------------------ | --------------------- |
| ClusterIP    | Inside the cluster | Service-to-service    |
| NodePort     | Each node's IP     | Quick local testing   |
| LoadBalancer | The internet       | Public-facing traffic |

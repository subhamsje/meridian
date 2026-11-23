"""
MERIDIAN Institutional Telemetry & Observability Layer
OpenTelemetry-compatible distributed tracing, structured metrics collection,
and real-time execution diagnostics.
"""

import time
import uuid
import threading
from typing import Dict, Any, List, Optional
from collections import deque
from pydantic import BaseModel, Field

class SpanRecord(BaseModel):
    trace_id: str
    span_id: str
    parent_span_id: Optional[str] = None
    name: str
    component: str
    start_time: float
    end_time: Optional[float] = None
    duration_ms: float = 0.0
    status: str = "OK"  # "OK" | "ERROR"
    attributes: Dict[str, Any] = Field(default_factory=dict)
    events: List[Dict[str, Any]] = Field(default_factory=list)

class SystemMetricsSummary(BaseModel):
    uptime_seconds: float
    total_requests: int
    active_traces: int
    completed_spans: int
    agent_inferences: int
    total_tokens_consumed: int
    latency_p50_ms: float
    latency_p95_ms: float
    latency_p99_ms: float
    status: str = "HEALTHY"

class TelemetryCollector:
    """
    In-memory OpenTelemetry-compatible telemetry collector.
    Records spans, aggregates request metrics, and provides queryable traces.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(TelemetryCollector, cls).__new__(cls)
                cls._instance._initialize()
            return cls._instance

    def _initialize(self):
        self.start_epoch = time.time()
        self.spans: deque = deque(maxlen=1000)
        self.active_spans: Dict[str, SpanRecord] = {}
        self.durations: deque = deque(maxlen=1000)
        self.total_requests = 0
        self.agent_inferences = 0
        self.total_tokens_consumed = 0
        self._collector_lock = threading.Lock()

    def start_span(
        self,
        name: str,
        component: str = "api",
        trace_id: Optional[str] = None,
        parent_span_id: Optional[str] = None,
        attributes: Optional[Dict[str, Any]] = None
    ) -> SpanRecord:
        with self._collector_lock:
            tid = trace_id or uuid.uuid4().hex
            sid = uuid.uuid4().hex[:16]
            span = SpanRecord(
                trace_id=tid,
                span_id=sid,
                parent_span_id=parent_span_id,
                name=name,
                component=component,
                start_time=time.time(),
                attributes=attributes or {}
            )
            self.active_spans[sid] = span
            return span

    def end_span(
        self,
        span_id: str,
        status: str = "OK",
        additional_attributes: Optional[Dict[str, Any]] = None
    ) -> Optional[SpanRecord]:
        with self._collector_lock:
            span = self.active_spans.pop(span_id, None)
            if not span:
                return None
            span.end_time = time.time()
            span.duration_ms = round((span.end_time - span.start_time) * 1000.0, 3)
            span.status = status
            if additional_attributes:
                span.attributes.update(additional_attributes)
            
            self.spans.append(span)
            self.durations.append(span.duration_ms)
            self.total_requests += 1
            return span

    def record_agent_inference(self, tokens: int = 0):
        with self._collector_lock:
            self.agent_inferences += 1
            self.total_tokens_consumed += tokens

    def get_metrics_summary(self) -> SystemMetricsSummary:
        with self._collector_lock:
            durations_sorted = sorted(list(self.durations))
            count = len(durations_sorted)
            
            p50 = durations_sorted[int(count * 0.50)] if count > 0 else 0.0
            p95 = durations_sorted[int(count * 0.95)] if count > 0 else 0.0
            p99 = durations_sorted[int(count * 0.99)] if count > 0 else 0.0

            return SystemMetricsSummary(
                uptime_seconds=round(time.time() - self.start_epoch, 2),
                total_requests=self.total_requests,
                active_traces=len(self.active_spans),
                completed_spans=len(self.spans),
                agent_inferences=self.agent_inferences,
                total_tokens_consumed=self.total_tokens_consumed,
                latency_p50_ms=round(p50, 2),
                latency_p95_ms=round(p95, 2),
                latency_p99_ms=round(p99, 2),
                status="HEALTHY"
            )

    def get_recent_traces(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._collector_lock:
            recent = list(self.spans)[-limit:]
            return [s.model_dump() for s in reversed(recent)]

# Global singleton
telemetry = TelemetryCollector()

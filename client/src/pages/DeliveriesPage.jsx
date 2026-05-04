import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import PageHeader from '../components/navigation/PageHeader';
import DeliveryMap from '../components/deliveries/DeliveryMap';
import { API_BASE_URL } from '../config';

const WORKSHOP_ADDRESS = 'Pilgrims Road, Upper Halling, Snodland, Kent ME2 1HR, United Kingdom';
const WORKSHOP_LATLNG = [51.3544355, 0.4284428];

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error || payload.errors?.join(', ') || 'The request could not be completed.';
    throw new Error(message);
  }

  return payload;
}

function renderAddress(customer) {
  if (!customer) {
    return 'No address available';
  }

  return [
    customer.address_line_1,
    customer.address_line_2,
    customer.address_line_3,
    customer.postcode,
  ]
    .filter(Boolean)
    .join(', ');
}

function fallbackLatLng(address) {
  const normalized = String(address || '').trim().toLowerCase();
  const seed = normalized.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const lat = 51.45 + ((seed * 37) % 80) * 0.003;
  const lng = -0.12 + ((seed * 53) % 80) * 0.004;
  return [lat, lng];
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function getDistance(origin, destination) {
  const [lat1, lon1] = origin;
  const [lat2, lon2] = destination;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lon2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const earthRadiusKm = 6371;
  return earthRadiusKm * c;
}

function optimizeRoute(tasks, originLatLng) {
  const available = tasks
    .map((task) => ({
      ...task,
      position: task.latlng || fallbackLatLng(task.address || task.customer_name || task.machine_label),
    }))
    .filter((task) => task.position && task.position.length === 2);

  const route = [];
  let current = originLatLng || [51.505, -0.09];

  while (available.length) {
    let closestIndex = 0;
    let closestDistance = getDistance(current, available[0].position);

    for (let index = 1; index < available.length; index += 1) {
      const candidateDistance = getDistance(current, available[index].position);
      if (candidateDistance < closestDistance) {
        closestDistance = candidateDistance;
        closestIndex = index;
      }
    }

    const [next] = available.splice(closestIndex, 1);
    route.push(next);
    current = next.position;
  }

  return route.map((task) => ({
    ...task,
    latlng: task.position,
    position: undefined,
  }));
}

function calculateRouteMetrics(routeTasks, originLatLng) {
  const points = routeTasks.map((task) => task.latlng || fallbackLatLng(task.address || task.customer_name || task.machine_label));
  let current = originLatLng || [51.505, -0.09];
  let totalDistance = 0;

  points.forEach((point) => {
    totalDistance += getDistance(current, point);
    current = point;
  });

  const estimatedTime = Math.round(totalDistance * 5 + routeTasks.length * 10);
  const stops = routeTasks.length;

  return {
    totalDistance: totalDistance.toFixed(1),
    estimatedTime,
    stops,
  };
}

function tryParseAddress(address) {
  return String(address || '').trim();
}

async function geocodeAddress(address) {
  if (!address) {
    return null;
  }

  const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  const response = await fetch(searchUrl, {
    headers: {
      'Accept-Language': 'en',
    },
  });
  const payload = await response.json();

  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const firstResult = payload[0];
  return [parseFloat(firstResult.lat), parseFloat(firstResult.lon)];
}

function DeliveriesPage() {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [routeTasks, setRouteTasks] = useState([]);
  const [dragItem, setDragItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [geocodeError, setGeocodeError] = useState('');
  const [geocodeCache, setGeocodeCache] = useState({});
  const geocodeQueueRef = useRef(new Set());
  const [startMode, setStartMode] = useState('workshop');
  const [customStartAddress, setCustomStartAddress] = useState('');

  const startAddress = startMode === 'workshop' || !customStartAddress.trim() ? WORKSHOP_ADDRESS : customStartAddress.trim();

  const startLatLng = useMemo(() => {
    if (startMode === 'workshop') {
      return WORKSHOP_LATLNG;
    }

    return geocodeCache[startAddress] || fallbackLatLng(startAddress);
  }, [geocodeCache, startAddress, startMode]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError('');

      try {
        const [jobsData, customersData, deliveriesData] = await Promise.all([
          requestJson('/repair-jobs'),
          requestJson('/customers'),
          requestJson('/deliveries'),
        ]);

        startTransition(() => {
          setJobs(jobsData);
          setCustomers(customersData);
          setDeliveries(deliveriesData);
        });
      } catch (loadError) {
        setError(loadError.message || 'Deliveries could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const customersById = useMemo(
    () => Object.fromEntries(customers.map((customer) => [customer.customer_id, customer])),
    [customers]
  );

  const availableTasks = useMemo(() => {
    const taskMap = routeTasks.reduce((map, item) => map.set(item.taskId, true), new Map());

    return jobs
      .filter((job) => ['Collected', 'Completed'].includes(job.status))
      .map((job) => {
        const customer = customersById[job.customer_id];
        const address = renderAddress(customer);
        const invoiceLabel = job.job_no ? `Job #${job.job_no}` : 'Unlinked job';
        const machineLabel = job.machine_make
          ? `${job.machine_make} ${job.machine_model_no || ''}`.trim()
          : `Machine #${job.machine_id}`;

        return {
          taskId: `job-${job.job_no}`,
          job_no: job.job_no,
          machine_label: machineLabel,
          customer_name: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown customer',
          address,
          status: job.status || 'Ready',
          reference: invoiceLabel,
        };
      })
      .filter((task) => !taskMap.has(task.taskId));
  }, [jobs, customersById, routeTasks]);

  const cachedAddresses = useMemo(
    () => new Set([
      startAddress,
      ...availableTasks.map((task) => task.address),
      ...routeTasks.map((task) => task.address),
    ].filter(Boolean)),
    [availableTasks, routeTasks, startAddress]
  );

  useEffect(() => {
    cachedAddresses.forEach((address) => {
      const parsed = tryParseAddress(address);
      if (!parsed || geocodeCache[parsed] || geocodeQueueRef.current.has(parsed)) {
        return;
      }

      geocodeQueueRef.current.add(parsed);
      geocodeAddress(parsed)
        .then((coords) => {
          setGeocodeCache((current) => ({
            ...current,
            [parsed]: coords || fallbackLatLng(parsed),
          }));
        })
        .catch(() => {
          setGeocodeCache((current) => ({
            ...current,
            [parsed]: fallbackLatLng(parsed),
          }));
          setGeocodeError('One or more delivery addresses could not be geocoded automatically. The route may use an approximate location.');
        })
        .finally(() => {
          geocodeQueueRef.current.delete(parsed);
        });
    });
  }, [cachedAddresses, geocodeCache]);

  const routeTasksWithLatLng = useMemo(
    () =>
      routeTasks.map((task) => ({
        ...task,
        latlng: geocodeCache[task.address] || fallbackLatLng(task.address),
      })),
    [routeTasks, geocodeCache]
  );

  const statistics = useMemo(
    () => calculateRouteMetrics(routeTasksWithLatLng, startLatLng),
    [routeTasksWithLatLng, startLatLng]
  );

  function handleDragStart(taskId, source) {
    setDragItem({ taskId, source });
  }

  function handleDragEnd() {
    setDragItem(null);
  }

  function addTaskToRoute(taskId) {
    const task = availableTasks.find((item) => item.taskId === taskId);
    if (!task || routeTasks.some((item) => item.taskId === taskId)) {
      return;
    }

    setRouteTasks((current) => optimizeRoute([...current, task].map((t) => ({
      ...t,
      latlng: geocodeCache[t.address] || fallbackLatLng(t.address),
    })), startLatLng));
  }

  function moveTaskInRoute(taskId, targetTaskId) {
    const currentIndex = routeTasks.findIndex((item) => item.taskId === taskId);
    const targetIndex = routeTasks.findIndex((item) => item.taskId === targetTaskId);
    if (currentIndex === -1 || targetIndex === -1 || currentIndex === targetIndex) {
      return;
    }

    const updated = [...routeTasks];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setRouteTasks(updated);
  }

  function handleDropOnRoute(taskId) {
    if (!dragItem) {
      return;
    }

    if (dragItem.source === 'available') {
      addTaskToRoute(dragItem.taskId);
    } else if (dragItem.source === 'route') {
      moveTaskInRoute(dragItem.taskId, taskId);
    }
  }

  function handleDropOnRouteZone(event) {
    event.preventDefault();
    if (!dragItem) {
      return;
    }

    if (dragItem.source === 'available') {
      addTaskToRoute(dragItem.taskId);
    }
  }

  function removeRouteTask(taskId) {
    setRouteTasks((current) => current.filter((item) => item.taskId !== taskId));
  }

  function autoOptimizeRoute() {
    setRouteTasks((current) => optimizeRoute(
      current.map((task) => ({
        ...task,
        latlng: geocodeCache[task.address] || fallbackLatLng(task.address),
      })),
      startLatLng
    ));
  }

  return (
    <div className="page-wrapper deliveries-page">
      <PageHeader
        eyebrow="Logistics"
        title="Deliveries & Route Planning"
        summary="Plan the delivery journey from machines ready for collection, then drop them onto the route board and review the map, order, and estimated travel insights."
      />

      {error ? <div className="feedback-banner error">{error}</div> : null}
      {geocodeError ? <div className="feedback-banner warning">{geocodeError}</div> : null}

      <div className="deliveries-page-grid">
        <div className="delivery-sidebar">
          <section className="surface-card hero-card" data-reveal="intro">
            <div>
              <div className="section-label">Route planning</div>
              <h3 className="section-title">Drop machines on the route board</h3>
              <p className="section-copy">
                Available deliveries are drawn from the workshop queue. Drag any ready task onto the route to build your delivery schedule.
              </p>
            </div>
          </section>

          <section className="surface-card delivery-panel">
            <div className="delivery-panel-header">
              <div>
                <h4 className="section-title">Route start address</h4>
                <p className="section-copy">Choose whether the route begins from the workshop or enter a custom start address.</p>
              </div>
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="startMode">
                Starting point
              </label>
              <select
                id="startMode"
                className="field-control"
                value={startMode}
                onChange={(event) => setStartMode(event.target.value)}
              >
                <option value="workshop">Workshop</option>
                <option value="custom">Home / other start address</option>
              </select>
            </div>

            {startMode === 'custom' ? (
              <div className="form-group">
                <label className="field-label" htmlFor="customStartAddress">
                  Enter your start address
                </label>
                <input
                  id="customStartAddress"
                  className="field-control"
                  placeholder="e.g. 123 Home Street, City"
                  type="text"
                  value={customStartAddress}
                  onChange={(event) => setCustomStartAddress(event.target.value)}
                />
              </div>
            ) : (
              <div className="field-copy">Using workshop as the route origin.</div>
            )}
          </section>

          <section className="surface-card delivery-panel">
            <div className="delivery-panel-header">
              <div>
                <h4 className="section-title">Available deliveries</h4>
                <p className="section-copy">Drag these entries to the route board on the right.</p>
              </div>
              <span className="badge">{availableTasks.length} ready</span>
            </div>

            <div className="delivery-list">
              {isLoading ? (
                <div className="loading-state">Loading tasks…</div>
              ) : availableTasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📦</div>
                  <h4 className="empty-state-title">No ready deliveries</h4>
                  <p className="empty-state-copy">
                    All collected jobs are already in the route or there are no ready tasks.
                  </p>
                </div>
              ) : (
                availableTasks.map((task) => (
                  <article
                    key={task.taskId}
                    className="delivery-task-card"
                    draggable
                    onDragStart={() => handleDragStart(task.taskId, 'available')}
                    onDragEnd={handleDragEnd}
                  >
                    <div>
                      <h5>{task.reference}</h5>
                      <p>{task.machine_label}</p>
                    </div>
                    <div className="delivery-task-meta">
                      <span>{task.customer_name}</span>
                      <span>{task.address}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="surface-card delivery-panel">
            <div className="delivery-panel-header">
              <div>
                <h4 className="section-title">Recent delivery records</h4>
                <p className="section-copy">Saved deliveries from the backend.</p>
              </div>
              <span className="badge">{deliveries.length}</span>
            </div>

            <div className="delivery-summary-list">
              {deliveries.slice(0, 4).map((delivery) => (
                <div className="delivery-summary-card" key={delivery.delivery_id}>
                  <span>#{delivery.delivery_id}</span>
                  <strong>£{Number(delivery.charge || 0).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="delivery-main">
          <section
            className="surface-card route-board"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDropOnRouteZone}
          >
            <div className="delivery-panel-header">
              <div>
                <h4 className="section-title">Route board</h4>
                <p className="section-copy">Drop tasks here and reorder them to shape the delivery route.</p>
              </div>
              <button className="secondary-button" onClick={autoOptimizeRoute} type="button">
                Auto optimize
              </button>
            </div>

            <div className="route-task-list">
              {routeTasks.length === 0 ? (
                <div className="empty-state">
                  <h4 className="empty-state-title">No route tasks yet</h4>
                  <p className="empty-state-copy">Drag items from the available deliveries list onto this board.</p>
                </div>
              ) : (
                routeTasks.map((task, index) => (
                  <article
                    key={task.taskId}
                    className="route-task-card"
                    draggable
                    onDragStart={() => handleDragStart(task.taskId, 'route')}
                    onDragEnd={handleDragEnd}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDropOnRoute(task.taskId)}
                  >
                    <div>
                      <span className="route-step">{index + 1}</span>
                      <div>
                        <h5>{task.reference}</h5>
                        <p>{task.customer_name}</p>
                      </div>
                    </div>
                    <div className="route-task-actions">
                      <button className="icon-button danger" onClick={() => removeRouteTask(task.taskId)} type="button">
                        ×
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="route-insights">
              <div>
                <p className="route-label">Stops</p>
                <strong>{statistics.stops}</strong>
              </div>
              <div>
                <p className="route-label">Route length</p>
                <strong>{statistics.totalDistance} km</strong>
              </div>
              <div>
                <p className="route-label">Estimated time</p>
                <strong>{statistics.estimatedTime} min</strong>
              </div>
            </div>
          </section>

          <DeliveryMap routeTasks={routeTasksWithLatLng} startLocation={startLatLng} />
        </div>
      </div>
    </div>
  );
}

export default DeliveriesPage;

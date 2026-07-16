# Artefacto 3 — Pruebas de Carga (Apache JMeter)

**Fecha**: 2025-06-28
**Target**: API de humanización de texto / creación de órdenes Mercado Pago
**Endpoint**: `POST /api/mercadopago/create-preference`
**Perfil**: 1000 usuarios concurrentes, ramp-up 30s, duración 5min

---

## Script XML Apache JMeter (.jmx)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="RestaurantVeg - Load Test">
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.tearDown_on_shutdown">true</boolProp>
      <stringProp name="TestPlan.comments">Escenario: 1000 usuarios concurrentes creando preferencias de pago</stringProp>
    </TestPlan>
    <hashTree>

      <!-- ===== CONFIGURACIÓN GLOBAL ===== -->
      <Arguments guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables">
        <collectionProp name="Arguments.arguments">
          <elementProp name="BASE_URL" elementType="Argument">
            <stringProp name="Argument.name">BASE_URL</stringProp>
            <stringProp name="Argument.value">https://restaurante-vegetariano-backend.vercel.app</stringProp>
            <stringProp name="Argument.desc">URL base de la API</stringProp>
          </elementProp>
          <elementProp name="THROUGHPUT_TARGET" elementType="Argument">
            <stringProp name="Argument.name">THROUGHPUT_TARGET</stringProp>
            <stringProp name="Argument.value">100</stringProp>
            <stringProp name="Argument.desc">Throughput objetivo en req/s</stringProp>
          </elementProp>
          <elementProp name="ERROR_THRESHOLD" elementType="Argument">
            <stringProp name="Argument.name">ERROR_THRESHOLD</stringProp>
            <stringProp name="Argument.value">1.0</stringProp>
            <stringProp name="Argument.desc">Máximo porcentaje de error aceptable</stringProp>
          </elementProp>
        </collectionProp>
      </Arguments>

      <!-- ===== HTTP REQUEST DEFAULTS ===== -->
      <ConfigTestElement guiclass="HttpDefaultsGui" testclass="ConfigTestElement" testname="HTTP Request Defaults">
        <stringProp name="HTTPSampler.domain">${BASE_URL}</stringProp>
        <stringProp name="HTTPSampler.protocol">https</stringProp>
        <stringProp name="HTTPSampler.connect_timeout">10000</stringProp>
        <stringProp name="HTTPSampler.response_timeout">30000</stringProp>
        <elementProp name="HTTPSampler.HEADERS" elementType="Header">
          <collectionProp name="Header.headers">
            <stringProp name="52127fbe-4a01-41cc-aff7-9a37131a6413">Content-Type</stringProp>
            <stringProp name="value">application/json</stringProp>
          </collectionProp>
        </elementProp>
      </ConfigTestElement>

      <!-- ===== HEADER MANAGER ===== -->
      <HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP Header Manager">
        <collectionProp name="HeaderManager.headers">
          <elementProp name="Content-Type" elementType="Header">
            <stringProp name="Header.name">Content-Type</stringProp>
            <stringProp name="Header.value">application/json</stringProp>
          </elementProp>
          <elementProp name="Accept" elementType="Header">
            <stringProp name="Header.name">Accept</stringProp>
            <stringProp name="Header.value">application/json</stringProp>
          </elementProp>
        </collectionProp>
      </HeaderManager>

      <!-- ===== HTTP COOKIE MANAGER ===== -->
      <CookieManager guiclass="CookiePanel" testclass="CookieManager" testname="HTTP Cookie Manager">
        <boolProp name="CookieManager.clearEachIteration">true</boolProp>
        <collectionProp name="CookieManager.cookies"/>
      </CookieManager>

      <!-- ===== DNS CACHE MANAGER ===== -->
      <DNSCacheManager guiclass="DNSCachePanel" testclass="DNSCacheManager" testname="DNS Cache Manager">
        <elementProp name="DNSCacheManager.dns_resolvers" elementType="Arguments">
          <collectionProp name="Arguments.arguments"/>
        </elementProp>
      </DNSCacheManager>

      <!-- ===== THREAD GROUP: 1000 usuarios ===== -->
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="1,000 Concurrent Users - Create Payment Preference">
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <stringProp name="LoopController.loops">-1</stringProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">1000</stringProp>
        <stringProp name="ThreadGroup.ramp_time">30</stringProp>
        <stringProp name="ThreadGroup.start_time">172800000</stringProp>
        <stringProp name="ThreadGroup.end_time">173100000</stringProp>
        <boolProp name="ThreadGroup.scheduler">true</boolProp>
        <stringProp name="ThreadGroup.duration">300</stringProp>
        <stringProp name="ThreadGroup.delay">0</stringProp>
        <boolProp name="ThreadGroup.same_user_on_next_iteration">false</boolProp>
      </ThreadGroup>
      <hashTree>

        <!-- === CSV Data Set Config: Datos sintéticos de items === -->
        <CSVDataSet guiclass="TestBeanGUI" testclass="CSVDataSet" testname="CSV Data - Menu Items">
          <stringProp name="filename">data/menu-items.csv</stringProp>
          <stringProp name="variableNames">ITEM_ID,ITEM_NAME,ITEM_PRICE</stringProp>
          <stringProp name="delimiter">,</stringProp>
          <boolProp name="quotedData">false</boolProp>
          <boolProp name="recycle">true</boolProp>
          <boolProp name="stopThread">false</boolProp>
          <stringProp name="shareMode">all</stringProp>
        </CSVDataSet>

        <!-- === Pre-processor: Generar payload dinámico === -->
        <JSR223PreProcessor guiclass="TestBeanGUI" testclass="JSR223PreProcessor" testname="Generate Dynamic Payload">
          <stringProp name="cacheKey">true</stringProp>
          <stringProp name="script">
import java.util.UUID;
import org.apache.commons.lang3.RandomStringUtils;

// Generar items aleatorios (1-5 items por pedido)
int itemCount = 1 + (int)(Math.random() * 4);
StringBuilder items = new StringBuilder("[");
for (int i = 0; i < itemCount; i++) {
    if (i > 0) items.append(",");
    String itemId = "item-" + UUID.randomUUID().toString().substring(0, 8);
    String itemName = "Plato " + RandomStringUtils.randomAlphabetic(6);
    double price = 15.0 + Math.random() * 85.0;
    int qty = 1 + (int)(Math.random() * 3);
    items.append(String.format(
        "{\"id\":\"%s\",\"title\":\"%s\",\"name\":\"%s\",\"quantity\":%d,\"price\":%.2f}",
        itemId, itemName, itemName, qty, price
    ));
}
items.append("]");

vars.put("PAYLOAD_ITEMS", items.toString());
vars.put("ORDER_ID", UUID.randomUUID().toString());
vars.put("CUSTOMER_NAME", "Cliente " + RandomStringUtils.randomAlphabetic(5));
vars.put("CUSTOMER_EMAIL", "cliente." + System.currentTimeMillis() + "@test.com");
          </stringProp>
          <stringProp name="scriptLanguage">groovy</stringProp>
        </JSR223PreProcessor>

        <!-- === HTTP REQUEST: Create Preference === -->
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="POST /api/mercadopago/create-preference">
          <stringProp name="HTTPSampler.domain"></stringProp>
          <stringProp name="HTTPSampler.port"></stringProp>
          <stringProp name="HTTPSampler.protocol"></stringProp>
          <stringProp name="HTTPSampler.contentEncoding">UTF-8</stringProp>
          <stringProp name="HTTPSampler.path">/api/mercadopago/create-preference</stringProp>
          <stringProp name="HTTPSampler.method">POST</stringProp>
          <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
          <boolProp name="HTTPSampler.auto_redirects">false</boolProp>
          <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
          <boolProp name="HTTPSampler.DO_MULTIPART_POST">false</boolProp>
          <stringProp name="HTTPSampler.embedded_url_re"></stringProp>
          <stringProp name="HTTPSampler.connect_timeout">10000</stringProp>
          <stringProp name="HTTPSampler.response_timeout">30000</stringProp>
          <stringProp name="HTTPSampler.postBodyRaw">true</stringProp>
          <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments">
              <elementProp name="body" elementType="Argument">
                <stringProp name="Argument.value">{
  "items": ${PAYLOAD_ITEMS},
  "notes": "Pedido generado por prueba de carga JMeter",
  "orderType": "DINE_IN",
  "customerName": "${CUSTOMER_NAME}",
  "customerEmail": "${CUSTOMER_EMAIL}",
  "customerPhone": "999888777"
}</stringProp>
                <stringProp name="Argument.metadata">=body</stringProp>
              </elementProp>
            </collectionProp>
          </elementProp>
        </HTTPSamplerProxy>
        <hashTree>

          <!-- === RESPONSE ASSERTION: Status 201 === -->
          <ResponseAssertion guiclass="AssertionGui" testclass="ResponseAssertion" testname="Assert HTTP 201 Created">
            <collectionProp name="Asserion.test_strings">
              <stringProp name="1419041995">201</stringProp>
            </collectionProp>
            <stringProp name="Assertion.test_field">Assertion.response_code</stringProp>
            <boolProp name="Assertion.assume_success">false</boolProp>
            <intProp name="Assertion.test_type">8</intProp>
          </ResponseAssertion>

          <!-- === JSON ASSERTION: Validar estructura respuesta === -->
          <JSONPathAssertion guiclass="JSONPathAssertionGui" testclass="JSONPathAssertion" testname="JSON Assert Response Schema">
            <stringProp name="JSON_PATH">$.orderId</stringProp>
            <stringProp name="EXPECTED_VALUE"></stringProp>
            <boolProp name="JSONVALIDATION">true</boolProp>
            <boolProp name="EXPECT_NULL">false</boolProp>
            <boolProp name="INVERT">false</boolProp>
            <boolProp name="ISREGEX">false</boolProp>
          </JSONPathAssertion>

          <!-- === DURATION ASSERTION: Tiempo máximo 5s === -->
          <DurationAssertion guiclass="DurationAssertionGui" testclass="DurationAssertion" testname="Max Response Time 5000ms">
            <stringProp name="DurationAssertion.duration">5000</stringProp>
          </DurationAssertion>
        </hashTree>
      </hashTree>

      <!-- ===== LISTENERS (Resultados) ===== -->
      <hashTree>
        <!-- Summary Report -->
        <SummaryReport guiclass="SummaryReport" testclass="SummaryReport" testname="Summary Report (Aggregate)"/>

        <!-- Active Threads Over Time -->
        <ResultCollector guiclass="GraphVisualizer" testclass="ResultCollector" testname="Active Threads Over Time">
          <boolProp name="ResultCollector.preciseloglevel">true</boolProp>
          <objProp>
            <name>saveConfig</name>
            <value class="SampleSaveConfiguration">
              <time>true</time>
              <latency>true</latency>
              <timestamp>true</timestamp>
              <success>true</success>
              <label>true</label>
              <code>true</code>
              <message>true</message>
              <threadName>true</threadName>
              <dataType>true</dataType>
              <encoding>false</encoding>
              <assertions>true</assertions>
              <subresults>true</subresults>
              <responseData>false</responseData>
              <sampleData>false</sampleData>
              <xml>true</xml>
              <fieldNames>true</fieldNames>
              <responseHeaders>false</responseHeaders>
              <requestHeaders>false</requestHeaders>
              <responseDataOnError>true</responseDataOnError>
              <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
              <assertionsResultsToSave>0</assertionsResultsToSave>
              <bytes>true</bytes>
              <sentBytes>true</sentBytes>
              <url>true</url>
              <threadCounts>true</threadCounts>
              <idleTime>true</idleTime>
            </value>
          </objProp>
          <stringProp name="filename">results/active-threads.csv</stringProp>
        </ResultCollector>

        <!-- Response Times Percentiles -->
        <ResultCollector guiclass="StatGraphVisualizer" testclass="ResultCollector" testname="Response Times Percentiles">
          <stringProp name="filename">results/response-percentiles.csv</stringProp>
        </ResultCollector>

        <!-- Errors Log -->
        <ResultCollector guiclass="ViewResultsFullVisualizer" testclass="ResultCollector" testname="Errors Log">
          <stringProp name="filename">results/errors.xml</stringProp>
        </ResultCollector>

        <!-- Backend Listener: InfluxDB (opcional) -->
        <BackendListener guiclass="BackendListenerGui" testclass="BackendListener" testname="InfluxDB Backend">
          <elementProp name="arguments" elementType="Arguments">
            <collectionProp name="Arguments.arguments">
              <stringProp name="717580524">influxdbUrl</stringProp>
              <stringProp name="value">http://localhost:8086/write?db=jmeter</stringProp>
              <stringProp name="338523413">application</stringProp>
              <stringProp name="value">RestaurantVegLoadTest</stringProp>
              <stringProp name="93874241">measurement</stringProp>
              <stringProp name="value">jmeter</stringProp>
              <stringProp name="29623781">summaryOnly</stringProp>
              <stringProp name="value">false</stringProp>
              <stringProp name="134201690">samplersList</stringProp>
              <stringProp name="value">.*</stringProp>
              <boolProp name="1301950701">true</boolProp>
              <stringProp name="1549737261">useRegexForSamplersList</stringProp>
            </collectionProp>
          </elementProp>
        </BackendListener>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

---

## Datos Sintéticos para CSV (`data/menu-items.csv`)

```csv
ITEM_ID,ITEM_NAME,ITEM_PRICE
menu-item-001,Ensalada Veggie Fresh,18.50
menu-item-002,Parrilla Mixta Premium,45.00
menu-item-003,Pollo a la Brasa Veg,32.00
menu-item-004,Lomo Saltado Veg,28.00
menu-item-005,Quinua Burger,22.00
menu-item-006,Smoothie Verde,15.00
menu-item-007,Pasta Alfredo Veg,26.00
menu-item-008,Tacos de Jackfruit,24.00
menu-item-009,Pizza Veggie,30.00
menu-item-010,Cheesecake Vegano,18.00
```

---

## Criterios de Aceptación de la Prueba

| Métrica | Umbral | Criterio |
|---------|--------|----------|
| **Throughput** | > 100 req/s | ✅ Pasa si promedio sostenido supera 100 req/s |
| **Error Rate** | < 1% | ✅ Fallos HTTP 4xx/5xx + timeouts deben ser < 1% |
| **p95 Latency** | < 3000ms | ✅ 95% de las respuestas deben estar bajo 3s |
| **p99 Latency** | < 5000ms | ✅ 99% bajo 5s (tiempo de timeout definido) |
| **Success Rate** | > 99% | ✅ Aserciones JSON + status code deben fallar en < 1% |
| **Connection Errors** | < 0.5% | ✅ Errores de conexión TCP/SSL deben ser mínimos |

---

## Escenarios Adicionales Sugeridos

```bash
# Escenario 1: Soak Test (estabilidad 2h)
# - Mismos parámetros pero duración = 7200s

# Escenario 2: Spike Test
# - 100 usuarios → salto a 2000 en 10s → mantener 2min → bajar
# - Detectar cold starts en Vercel

# Escenario 3: Stress Test de BD
# - Ejecutar consultas N+1 de getAdminStats repetidamente
# - Monitorear pool de conexiones de Neon
```

## Comando para Ejecutar

```bash
# CLI
jmeter -n -t docs/audit-2025-06-28/04-pruebas-carga-JMeter.md.jmx \
  -l results/load-test.jtl \
  -e -o results/load-test-report \
  -JBASE_URL=http://localhost:3001

# Docker
docker run --rm -v $(pwd):/test -w /test \
  justb4/jmeter:5.6.3 \
  -n -t /test/docs/audit-2025-06-28/04-pruebas-carga-JMeter.md.jmx \
  -l /test/results/load-test.jtl \
  -e -o /test/results/load-test-report
```

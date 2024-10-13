import React from "react";
import Globe from "react-globe.gl";
import * as d3 from "d3";
import indexBy from "index-array-by";
import { Input, Select, Space, Form, Button } from "antd";

const GlobePlugin = () => {
    const { useState, useEffect, useRef } = React;

    const COUNTRY = "Singapore";
    const MAP_CENTER = { lat: 1.2634, lng: 103.8467, altitude: 1.2 };
    const OPACITY = 0.3;

    const World = () => {
        const globeEl = useRef();
        const [ports, setPorts] = useState([]);
        const [routes, setRoutes] = useState([]);
        const [hoverArc, setHoverArc] = useState();
        const [srcPort, setSrcPort] = useState(null);
        const [dstPort, setDstPort] = useState(null);
        const [options, setOptions] = useState([]);
        const [result, setResult] = useState(null);
        const [costScore, setCostScore] = useState(0);
        const [riskScore, setRiskScore] = useState(0);
        const [overallScore, setOverallScore] = useState(0);

        const [costNormalScore, setCostNormalScore] = useState(0);
        const [riskNormalScore, setRiskNormalScore] = useState(0);
        const [overallNormalScore, setOverallNormalScore] = useState(0);
        const [route1, setRoute1] = useState(null);
        const [route2, setRoute2] = useState(null);
        const [form] = Form.useForm();
        useEffect(() => {
            let filteredPorts = [
                {
                    portID: 1,
                    portName: "Tanjong Pagar",
                    lat: 1.2634,
                    lng: 103.8467,
                },
                {
                    portID: 2,
                    portName: "Keppel",
                    lat: 1.2623,
                    lng: 103.8429,
                },
                {
                    portID: 3,
                    portName: "Brani",
                    lat: 1.2565,
                    lng: 103.8445,
                },
                {
                    portID: 4,
                    portName: "Pasir Panjang",
                    lat: 1.27,
                    lng: 103.7632,
                },
                {
                    portID: 5,
                    portName: "Tuas",
                    lat: 1.3078,
                    lng: 103.6318,
                },
                {
                    portID: 6,
                    portName: "Antwerp",
                    lat: 51.2602,
                    lng: 4.3997,
                },
                {
                    portID: 7,
                    portName: "Sines",
                    lat: 37.9561,
                    lng: -8.8698,
                },
                {
                    portID: 8,
                    portName: "Rotterdam",
                    lat: 51.9531,
                    lng: 4.1226,
                },
                {
                    portID: 9,
                    portName: "Mumbai",
                    lat: 18.9543,
                    lng: 72.8496,
                },
                {
                    portID: 10,
                    portName: "Guangzhou",
                    lat: 22.8292,
                    lng: 113.6167,
                },
                {
                    portID: 11,
                    portName: "Busan",
                    lat: 35.0988,
                    lng: 129.0403,
                },
                {
                    portID: 12,
                    portName: "Chennai",
                    lat: 13.0853,
                    lng: 80.2916,
                },
                {
                    portID: 13,
                    portName: "Panama",
                    lat: 8.95,
                    lng: -79.5665,
                },
                {
                    portID: 14,
                    portName: "Buenos Aires",
                    lat: -34.6081,
                    lng: -58.3702,
                },
                {
                    portID: 15,
                    portName: "New York",
                    lat: 40.6494,
                    lng: -74.026,
                },
                {
                    portID: 16,
                    portName: "Dammam",
                    lat: 26.4283,
                    lng: 50.101,
                },
                {
                    portID: 17,
                    portName: "Port Said",
                    lat: 31.2653,
                    lng: 32.3019,
                },
                {
                    portID: 18,
                    portName: "Durban",
                    lat: -29.8716,
                    lng: 31.0262,
                },
            ];

            let filteredRoutes = [
                {
                    service: "PSA",
                    srcIata: "Durban",
                    dstIata: "Panama",
                    srcPort: {
                        portID: 18,
                        portName: "Durban",
                        lat: -29.8716,
                        lng: 31.0262,
                    },
                    dstPort: {
                        portID: 13,
                        portName: "Panama",
                        lat: 8.95,
                        lng: -79.5665,
                    },
                    transitPorts: [],
                },
                {
                    service: "PSA",
                    srcIata: "Dammam",
                    dstIata: "Sines",
                    srcPort: {
                        portID: 16,
                        portName: "Dammam",
                        lat: 26.4283,
                        lng: 50.101,
                    },
                    dstPort: {
                        portID: 7,
                        portName: "Sines",
                        lat: 37.9561,
                        lng: -8.8698,
                    },
                    transitPorts: [],
                },
                {
                    service: "PSA",
                    srcIata: "Keppel",
                    dstIata: "Brani",
                    srcPort: {
                        portID: 2,
                        portName: "Keppel",
                        lat: 1.2623,
                        lng: 103.8429,
                    },
                    dstPort: {
                        portID: 3,
                        portName: "Brani",
                        lat: 1.2565,
                        lng: 103.8445,
                    },
                    transitPorts: [],
                },
                {
                    service: "PSA",
                    srcIata: "Sines",
                    dstIata: "Chennai",
                    srcPort: {
                        portID: 7,
                        portName: "Sines",
                        lat: 37.9561,
                        lng: -8.8698,
                    },
                    dstPort: {
                        portID: 12,
                        portName: "Chennai",
                        lat: 13.0853,
                        lng: 80.2916,
                    },
                    transitPorts: [
                        {
                            portID: 18,
                            portName: "Durban",
                            lat: -29.8716,
                            lng: 31.0262,
                        },
                    ],
                },
                {
                    service: "PSA",
                    srcIata: "Rotterdam",
                    dstIata: "Dammam",
                    srcPort: {
                        portID: 8,
                        portName: "Rotterdam",
                        lat: 51.9531,
                        lng: 4.1226,
                    },
                    dstPort: {
                        portID: 16,
                        portName: "Dammam",
                        lat: 26.4283,
                        lng: 50.101,
                    },
                    transitPorts: [],
                },
                {
                    service: "PSA",
                    srcIata: "Port Said",
                    dstIata: "Durban",
                    srcPort: {
                        portID: 17,
                        portName: "Port Said",
                        lat: 31.2653,
                        lng: 32.3019,
                    },
                    dstPort: {
                        portID: 18,
                        portName: "Durban",
                        lat: -29.8716,
                        lng: 31.0262,
                    },
                    transitPorts: [],
                },
                {
                    service: "PSA",
                    srcIata: "Buenos Aires",
                    dstIata: "Dammam",
                    srcPort: {
                        portID: 14,
                        portName: "Buenos Aires",
                        lat: -34.6081,
                        lng: -58.3702,
                    },
                    dstPort: {
                        portID: 16,
                        portName: "Dammam",
                        lat: 26.4283,
                        lng: 50.101,
                    },
                    transitPorts: [
                        {
                            portID: 4,
                            portName: "Pasir Panjang",
                            lat: 1.27,
                            lng: 103.7632,
                        },
                        {
                            portID: 6,
                            portName: "Antwerp",
                            lat: 51.2602,
                            lng: 4.3997,
                        },
                    ],
                },
                {
                    service: "PSA",
                    srcIata: "Sines",
                    dstIata: "Guangzhou",
                    srcPort: {
                        portID: 7,
                        portName: "Sines",
                        lat: 37.9561,
                        lng: -8.8698,
                    },
                    dstPort: {
                        portID: 10,
                        portName: "Guangzhou",
                        lat: 22.8292,
                        lng: 113.6167,
                    },
                    transitPorts: [
                        {
                            portID: 1,
                            portName: "Tanjong Pagar",
                            lat: 1.2634,
                            lng: 103.8467,
                        },
                        {
                            portID: 12,
                            portName: "Chennai",
                            lat: 13.0853,
                            lng: 80.2916,
                        },
                    ],
                },
                {
                    service: "PSA",
                    srcIata: "Antwerp",
                    dstIata: "Rotterdam",
                    srcPort: {
                        portID: 6,
                        portName: "Antwerp",
                        lat: 51.2602,
                        lng: 4.3997,
                    },
                    dstPort: {
                        portID: 8,
                        portName: "Rotterdam",
                        lat: 51.9531,
                        lng: 4.1226,
                    },
                    transitPorts: [],
                },
                {
                    service: "PSA",
                    srcIata: "Tuas",
                    dstIata: "Guangzhou",
                    srcPort: {
                        portID: 5,
                        portName: "Tuas",
                        lat: 1.3078,
                        lng: 103.6318,
                    },
                    dstPort: {
                        portID: 10,
                        portName: "Guangzhou",
                        lat: 22.8292,
                        lng: 113.6167,
                    },
                    transitPorts: [
                        {
                            portID: 17,
                            portName: "Port Said",
                            lat: 31.2653,
                            lng: 32.3019,
                        },
                        {
                            portID: 13,
                            portName: "Panama",
                            lat: 8.95,
                            lng: -79.5665,
                        },
                    ],
                },
            ];

            setPorts(filteredPorts);
            let options = filteredPorts?.map((item) => ({
                value: item?.portID,
                label: item?.portName,
            }));
            console.log(options);
            setOptions(options);
            setRoutes(filteredRoutes);
            // console.log(filteredPorts, filteredRoutes)

            globeEl.current.pointOfView(MAP_CENTER, 4000);
        }, []);

        const handleSrcChange = (value) => {
            setSrcPort(value);
            form.setFieldValue(srcPort, value);
        };

        const handleDstChange = (value) => {
            setDstPort(value);
            form.setFieldValue(dstPort, value);
        };

        const handleFormSubmit = async (values) => {
            values = form.getFieldsValue();
            console.log(values);
            try {
                const response = await fetch(
                    `http://localhost:5050/record/predictRR`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(values),
                    }
                );
                if (!response.ok) {
                    const message = `An error occurred: ${response.statusText}`;
                    console.error(message);
                    return;
                }
                const records = await response.json();
                // setRecords(records);
                setResult(records);
                console.log(records);
                setCostScore(
                    parseFloat(records.bestRoute.costEfficiency).toFixed(2)
                );
                setRiskScore(parseFloat(records.bestRoute.risk).toFixed(2));
                setOverallScore(
                    parseFloat(records.bestRoute.weightedScore).toFixed(2)
                );
                setCostNormalScore(
                    parseFloat(records.normalRoute.costEfficiency).toFixed(2)
                );
                setRiskNormalScore(
                    parseFloat(records.normalRoute.risk).toFixed(2)
                );
                setOverallNormalScore(
                    parseFloat(records.normalRoute.weightedScore).toFixed(2)
                );
                const route_1 = records.bestRoute.route
                    .map((location) => location.portName || location.city)
                    .join(" --> ");
                const route_2 = records.normalRoute.route
                    .map((location) => location.portName || location.city)
                    .join(" --> ");
                // console.log(route_1, route_2)
                setRoute1(route_1);
                setRoute2(route_2);
            } catch (error) {
                console.error(
                    "A problem occurred with your fetch operation: ",
                    error
                );
            } finally {
                // setForm({ name: "", position: "", level: "" });
                // navigate("/");
            }
        };

        const handleValuesChange = () => {
            const values = form.getFieldsValue();
            console.log(values);
            if (values.srcPort || values.dstPort) {
                // console.log(values.srcPort)
                form.setFieldsValue({
                    srcPort: values.srcPort,
                    dstPort: values.dstPort,
                });
            }
        };

        function generateArcSegments(route) {
            const { srcPort, dstPort, transitPorts, srcIata, dstIata } = route;
            const stops = [srcPort, ...transitPorts, dstPort, srcIata, dstIata];

            // Create arc segments for each pair of consecutive ports
            const segments = [];
            for (let i = 0; i < stops.length - 1; i++) {
                segments.push({
                    srcPort: stops[i],
                    dstPort: stops[i + 1],
                    service: route.service,
                    srcIata: srcIata,
                    dstIata: dstIata,
                    color: route.color, // Keep same color for all segments of the route
                });
            }

            return segments;
        }

        const routesData = routes.flatMap(generateArcSegments);
        console.log(routesData);

        return (
            <div className="w-full h-full">
                <div className="flex-col justify-center p-8">
                    <Form form={form} onValuesChange={handleValuesChange}>
                        <Space>
                            <Form.Item label="Source Port:" name="srcPort">
                                <Select
                                    // defaultValue="Tuas"
                                    name="srcPort"
                                    style={{ width: 120 }}
                                    onChange={handleSrcChange}
                                    options={options}
                                />
                            </Form.Item>
                            <Form.Item label="Destination Port:" name="dstPort">
                                <Select
                                    // defaultValue="Tuas"
                                    name="dstPort"
                                    style={{ width: 120 }}
                                    onChange={handleDstChange}
                                    options={options}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    onClick={handleFormSubmit}
                                >
                                    Submit
                                </Button>
                            </Form.Item>
                        </Space>
                    </Form>
                    {result && (
                        <div className="flex flex-row justify-between space-x-4">
                            {/* Optimised Route */}
                            <div className="flex-1 border p-4">
                                <div className="font-bold text-xl">
                                    Optimised Route
                                </div>
                                <div className="text-lg">
                                    Route: {route1}
                                    <br />
                                    <span>
                                        Cost Efficiency:{" "}
                                        <span className="text-green-500">
                                            {costScore}
                                        </span>
                                        /5
                                    </span>
                                    <br />
                                    <span>
                                        Risk Level:{" "}
                                        <span className="text-red-500">
                                            {riskScore}
                                        </span>
                                        /5
                                    </span>
                                    <br />
                                    <span className="font-bold">
                                        Overall Rating: {overallScore}/5
                                    </span>
                                </div>
                            </div>

                            {/* Conditional Rendering: Show Conventional Route only if its rating is less than the Optimised Route */}
                            {overallNormalScore < overallScore && (
                                <div className="flex-1 border p-4">
                                    <div className="font-bold text-xl">
                                        Conventional Route
                                    </div>
                                    <div className="text-lg">
                                        Route: {route2}
                                        <br />
                                        <span>
                                            Cost Efficiency:{" "}
                                            <span className="text-green-500">
                                                {costNormalScore}
                                            </span>
                                            /5
                                        </span>
                                        <br />
                                        <span>
                                            Risk Level:{" "}
                                            <span className="text-red-500">
                                                {riskNormalScore}
                                            </span>
                                            /5
                                        </span>
                                        <br />
                                        <span className="font-bold">
                                            Overall Rating: {overallNormalScore}
                                            /5
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-1/9">
                    <Globe
                        ref={globeEl}
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                        arcsData={routesData}
                        arcLabel={(d) =>
                            `${d.service}: ${d.srcIata} &#8594; ${d.dstIata}`
                        }
                        arcStartLat={(d) => +d.srcPort.lat}
                        arcStartLng={(d) => +d.srcPort.lng}
                        arcEndLat={(d) => +d.dstPort.lat}
                        arcEndLng={(d) => +d.dstPort.lng}
                        arcDashLength={0.4}
                        arcDashGap={1}
                        arcStroke={0.5}
                        arcDashAnimateTime={1500}
                        arcsTransitionDuration={0}
                        arcColor={(d) => {
                            const op = !hoverArc
                                ? OPACITY
                                : d === hoverArc
                                ? 0.9
                                : OPACITY / 2;
                            return [
                                `rgba(0, 255, 0, ${op})`,
                                `rgba(255, 0, 0, ${op})`,
                            ];
                        }}
                        onArcHover={setHoverArc}
                        pointsData={ports}
                        pointColor={() => "orange"}
                        pointAltitude={0}
                        pointRadius={0.4}
                        pointsMerge={true}
                    />
                </div>
            </div>
        );
    };

    return World();
};

export default GlobePlugin;

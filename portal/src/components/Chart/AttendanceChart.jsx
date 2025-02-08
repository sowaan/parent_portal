import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import Datepicker from "react-tailwindcss-datepicker";

const options = {
  colors: ["#10C0B2", "#259AE6"],
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "bar",
    height: 335,
    stacked: true,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  responsive: [
    {
      breakpoint: 1536,
      options: {
        plotOptions: {
          bar: {
            borderRadius: 0,
            columnWidth: "25%",
          },
        },
      },
    },
  ],
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 0,
      columnWidth: "25%",
      borderRadiusApplication: "end",
      borderRadiusWhenStacked: "last",
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: ["M", "T", "W", "T", "F", "S", "S"],
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
    fontFamily: "Satoshi",
    fontWeight: 500,
    fontSize: "14px",

    markers: {
      radius: 99,
    },
  },
  fill: {
    opacity: 1,
  },
};

const AttendanceChart = ({ presents, absents, dateRange, setDateRange }) => {
  const [state, setState] = useState([
    {
      name: "Present",
      data: [0, 0, 0, 0, 0, 0, 0],
    },
    {
      name: "Absent",
      data: [0, 0, 0, 0, 0, 0, 0],
    },
  ]);

  useEffect(() => {
    setState([
      {
        name: "Present",
        data: presents,
      },
      {
        name: "Absent",
        data: absents,
      },
    ]);
  }, [presents, absents]);

  return (
    <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Attendance
          </h4>
        </div>
        <div>
          <Datepicker
            classNames="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
            value={dateRange}
            onChange={(newValue) => {
              setDateRange({
                startDate: newValue.startDate.toISOString(),
                endDate: newValue.endDate.toISOString(),
              });
            }}
          />
        </div>
      </div>

      <div>
        <div id="chartTwo" className="-ml-5 -mb-9">
          <ReactApexChart
            options={options}
            series={state}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;

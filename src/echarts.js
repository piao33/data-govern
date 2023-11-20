import * as echarts from 'echarts/core'
import { BarChart, PieChart, GaugeChart, LineChart, ScatterChart, RadarChart } from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent,
    ToolboxComponent,
    BrushComponent,
    MarkAreaComponent,
    MarkLineComponent,
    MarkPointComponent,
    DataZoomSliderComponent,
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
    RadarChart,
    BarChart, 
    PieChart,
    GaugeChart,
    LineChart,
    ScatterChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent,
    ToolboxComponent,
    BrushComponent,
    MarkAreaComponent,
    MarkLineComponent,
    MarkPointComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer,
    DataZoomSliderComponent
])

export default echarts;
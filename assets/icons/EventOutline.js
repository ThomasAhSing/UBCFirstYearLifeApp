import * as React from "react"
import Svg, { Rect, Circle, Path } from "react-native-svg"

function EventOutline({size = 24, ...props}) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 512 512"
      {...props}
    >
      <Rect
        width={416}
        height={384}
        x={48}
        y={80}
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={32}
        rx={48}
      />
      <Circle cx={296} cy={232} r={24} fill="currentColor" />
      <Circle cx={376} cy={232} r={24} fill="currentColor" />
      <Circle cx={296} cy={312} r={24} fill="currentColor" />
      <Circle cx={376} cy={312} r={24} fill="currentColor" />
      <Circle cx={136} cy={312} r={24} fill="currentColor" />
      <Circle cx={216} cy={312} r={24} fill="currentColor" />
      <Circle cx={136} cy={392} r={24} fill="currentColor" />
      <Circle cx={216} cy={392} r={24} fill="currentColor" />
      <Circle cx={296} cy={392} r={24} fill="currentColor" />
      <Path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={32}
        d="M128 48v32m256-32v32"
      />
      <Path
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={32}
        d="M464 160H48"
      />
    </Svg>
  )
}

export default EventOutline

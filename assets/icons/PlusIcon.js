import * as React from "react"
import Svg, { Path } from "react-native-svg"

function PlusIcon({size = 24, color="currentColor", ...props}) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
       width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke={color}
      className="size-6"
      {...props}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </Svg>
  )
}

export default PlusIcon

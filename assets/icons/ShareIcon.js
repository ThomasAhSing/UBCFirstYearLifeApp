import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ShareIcon({size = 24, color="currentColor", ...props}) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon icon-tabler icons-tabler-outline icon-tabler-share-3"
      {...props}
    >
      <Path d="M0 0h24v24H0z" stroke="none" />
      <Path d="M13 4v4C6.425 9.028 3.98 14.788 3 20c-.037.206 5.384-5.962 10-6v4l8-7-8-7z" />
    </Svg>
  )
}

export default ShareIcon

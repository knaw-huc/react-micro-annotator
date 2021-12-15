import {memo} from "react";

type RecogitoRootProps = {
  id: string
}

function alwaysMemo() {
  return () => true;
}

/**
 * Create a single, persistent dom node for all recogito instances
 */
export const RecogitoRoot = memo((props: RecogitoRootProps) => {
  return <div id={props.id} className="recogito-doc"/>
}, alwaysMemo())

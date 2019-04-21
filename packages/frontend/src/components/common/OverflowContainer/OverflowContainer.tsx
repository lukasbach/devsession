import {ResizeSensor} from "@blueprintjs/core";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {CSSProperties} from "react";

export const OverflowContainer: React.FunctionComponent<{
  elements: React.ReactNode[],
  renderOverflowElements: (overflowedElements: React.ReactNode[]) => void,
  containerStyle?: CSSProperties,
  showAll?: boolean
}> = props => {
  const [width, setWidth] = useState(0);
  const [itemsWidths, setItemsWidths] = useState<number[]>([]);
  const [overflownItemsIndices, setOverflownItemsIndices] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      let overflown = [];
      let counter = 0;

      for (let i = 0; i < containerRef.current.children.length; i++) {
        const child = containerRef.current.children[i];

        if (!itemsWidths[i]) {
          itemsWidths[i] = child.clientWidth;
        }

        counter += itemsWidths[i];

        if (counter > width) {
          overflown.push(i);
        }
      }

      setItemsWidths(itemsWidths);
      setOverflownItemsIndices(overflown);
      props.renderOverflowElements(props.elements.filter((el, i) => overflownItemsIndices.includes(i)));
      console.log(`Hiding ${overflown.length} items, ${counter}`);
    }
  }, [width, props.elements]);

  return (
    <ResizeSensor onResize={entries => setWidth(entries[0].contentRect.width)}>
      <div ref={containerRef} style={{ overflow: 'hidden', ...(props.containerStyle || {}) }}>
        {
          props.elements
            .map((el, i) => !overflownItemsIndices.includes(i) || props.showAll ? el : <div className='hiddenitem' />)
        }
      </div>
    </ResizeSensor>
  );
};

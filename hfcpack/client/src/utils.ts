export function useSpliter(pos: 'top' | 'right' | 'bottom' | 'left', elem: HTMLDivElement, onChange: (offset: number) => void) {
  const isVertical = pos === 'left' || pos === 'right'
  const style: any = {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    cursor: isVertical ? 'col-resize' : 'row-resize',
    height: isVertical ? '100%' : '6px',
    width: isVertical ? '6px' : '100%',
    zIndex: '1',
  }

  if (pos === 'top') {
    delete style.bottom
    style.top = '-3px'
  }

  else if (pos === 'left') {
    delete style.right
    style.left = '-3px'
  }

  else if (pos === 'right') {
    delete style.left
    style.right = '-3px'
  }

  else if (pos === 'bottom') {
    delete style.top
    style.bottom = '-3px'
  }

  Object.assign(elem.style, style)

  let dragging = false
  let startPos = 0
  let offset = 0

  function onDragStart(e: MouseEvent) {
    dragging = true
    document.body.classList.add('dragging')
    document.body.classList.add(isVertical ? 'dragging-col' : 'dragging-row')
    startPos = (isVertical ? e.x : e.y) - offset

    function onDragMove(e: MouseEvent) {
      if (!dragging)
        return

      const currentPos = isVertical ? e.x : e.y
      offset = currentPos - startPos

      onChange(offset)
    }

    function onDragEnd() {
      dragging = false
      document.body.classList.remove('dragging')
      document.body.classList.remove(isVertical ? 'dragging-col' : 'dragging-row')
      document.removeEventListener('mousemove', onDragMove)
      document.removeEventListener('mouseup', onDragMove)
      document.removeEventListener('mouseleave', onDragMove)
    }

    document.addEventListener('mousemove', onDragMove)
    document.addEventListener('mouseup', onDragEnd)
    document.addEventListener('mouseleave', onDragEnd)
  }

  elem.onmousedown = onDragStart
}

export function useResizer(
  pos: 'top' | 'right' | 'bottom' | 'left',
  elem: HTMLDivElement,
  opts: {
    onStart?: () => void
    onMove?: (offset: number) => void
    onEnd?: () => void
  } = {},
) {
  const isVertical = pos === 'left' || pos === 'right'
  const style: any = {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    cursor: isVertical ? 'col-resize' : 'row-resize',
    height: isVertical ? '100%' : '4px',
    width: isVertical ? '4px' : '100%',
    zIndex: '1',
  }

  if (pos === 'top') {
    delete style.bottom
    style.top = '-2px'
  }
  else if (pos === 'left') {
    delete style.right
    style.left = '-2px'
  }
  else if (pos === 'right') {
    delete style.left
    style.right = '-2px'
  }
  else if (pos === 'bottom') {
    delete style.top
    style.bottom = '-2px'
  }

  Object.assign(elem.style, style)

  function onDragStart(e: MouseEvent) {
    document.body.classList.add('dragging')
    document.body.style.cursor = isVertical ? 'col-resize' : 'row-resize'

    let offset = 0
    let dragging = true
    const startPos = isVertical ? e.x : e.y
    opts.onStart?.()

    function onDragMove(e: MouseEvent) {
      if (!dragging)
        return

      const currentPos = isVertical ? e.x : e.y
      offset = currentPos - startPos

      opts.onMove?.(offset)
    }

    function onDragEnd() {
      dragging = false
      document.body.classList.remove('dragging')
      document.body.style.cursor = 'auto'
      document.removeEventListener('mousemove', onDragMove)
      document.removeEventListener('mouseup', onDragMove)
      document.removeEventListener('mouseleave', onDragMove)
      opts.onEnd?.()
    }

    document.addEventListener('mousemove', onDragMove)
    document.addEventListener('mouseup', onDragEnd)
    document.addEventListener('mouseleave', onDragEnd)
  }

  elem.onmousedown = onDragStart
}

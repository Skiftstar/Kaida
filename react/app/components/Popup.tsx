export function Popup({
  open,
  onClose,
  children
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return open ? (
    <div
      onClick={onClose}
      style={{
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        height: '100%',
        aspectRatio: '9 / 19',
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: '20px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        className={`a`}
        onClick={(e) => {
          e.stopPropagation()
        }}
        style={{
          height: '80%',
          aspectRatio: '9 / 19',
          overflowY: 'scroll',
          borderRadius: '20px',
          padding: '5px'
        }}
      >
        {children}
      </div>
    </div>
  ) : (
    <div style={{ display: 'none' }}></div>
  )
}

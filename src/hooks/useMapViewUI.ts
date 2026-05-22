import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

export interface MapViewUIResult {
  profileMenuRef: React.RefObject<HTMLDivElement | null>
  profileMenuRefDesktop: React.RefObject<HTMLDivElement | null>
  mobileSheetExpanded: boolean
  setMobileSheetExpanded: Dispatch<SetStateAction<boolean>>
  sidebarCollapsed: boolean
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>
  filterPanelOpen: boolean
  setFilterPanelOpen: Dispatch<SetStateAction<boolean>>
  profileMenuOpen: boolean
  setProfileMenuOpen: Dispatch<SetStateAction<boolean>>
  profileEditSheetOpen: boolean
  setProfileEditSheetOpen: Dispatch<SetStateAction<boolean>>
  openProfileEdit: () => void
}

export function useMapViewUI(): MapViewUIResult {
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const profileMenuRefDesktop = useRef<HTMLDivElement | null>(null)
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [profileEditSheetOpen, setProfileEditSheetOpen] = useState(false)

  const openProfileEdit = useCallback(() => {
    setProfileEditSheetOpen(true)
    setProfileMenuOpen(false)
  }, [])

  useEffect(() => {
    if (!profileMenuOpen) return

    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (
        !(target instanceof Node)
        || profileMenuRef.current?.contains(target)
        || profileMenuRefDesktop.current?.contains(target)
      ) return
      setProfileMenuOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      setProfileMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileMenuOpen])

  return {
    profileMenuRef,
    profileMenuRefDesktop,
    mobileSheetExpanded,
    setMobileSheetExpanded,
    sidebarCollapsed,
    setSidebarCollapsed,
    filterPanelOpen,
    setFilterPanelOpen,
    profileMenuOpen,
    setProfileMenuOpen,
    profileEditSheetOpen,
    setProfileEditSheetOpen,
    openProfileEdit,
  }
}

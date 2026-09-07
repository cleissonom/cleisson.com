"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent
} from "react"

import { Grid, MutedText } from "@/components/design-system"
import {
  ProjectCard,
  type ProjectCardImage,
  type ProjectCardProject
} from "@/components/project-card"
import type { ProjectStage, ProjectType } from "@/data/i18n/types"
import type { Locale } from "@/lib/i18n"

type ProjectsFilterCopy = {
  filterHeading: string
  allLabels: string
  clearLabels: string
  noResultsDescription: string
  resultsCount: string
}

const subscribeToHydration = () => () => {}
const clientReady = () => true
const serverReady = () => false

export function ProjectListWithFilters({
  projects,
  locale,
  readMoreLabel,
  readMoreAboutPrefix,
  detailsUnavailableLabel,
  typeLabels,
  stageLabels,
  copy
}: {
  projects: (ProjectCardProject & { cardImage: ProjectCardImage | null })[]
  locale: Locale
  readMoreLabel: string
  readMoreAboutPrefix: string
  detailsUnavailableLabel: string
  typeLabels: Record<ProjectType, string>
  stageLabels: Record<ProjectStage, string>
  copy: ProjectsFilterCopy
}) {
  const isReady = useSyncExternalStore(subscribeToHydration, clientReady, serverReady)
  const dropdownRef = useRef<HTMLDetailsElement>(null)
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  useEffect(() => {
    function dismissOutside(event: PointerEvent) {
      const dropdown = dropdownRef.current
      if (dropdown?.open && event.target instanceof Node && !dropdown.contains(event.target)) {
        dropdown.open = false
      }
    }
    document.addEventListener("pointerdown", dismissOutside)
    return () => document.removeEventListener("pointerdown", dismissOutside)
  }, [])
  const availableLabels = useMemo(
    () =>
      Array.from(new Set(projects.flatMap((project) => project.tags))).sort((a, b) =>
        a.localeCompare(b, locale, { sensitivity: "base" })
      ),
    [projects, locale]
  )
  const selectedLabelKeys = useMemo(
    () => new Set(selectedLabels.map((label) => label.toLocaleLowerCase(locale))),
    [selectedLabels, locale]
  )
  const filteredProjects = useMemo(
    () =>
      selectedLabelKeys.size > 0
        ? projects.filter((project) =>
            project.tags.some((tag) => selectedLabelKeys.has(tag.toLocaleLowerCase(locale)))
          )
        : projects,
    [projects, selectedLabelKeys, locale]
  )
  const selectedLabelSummary =
    selectedLabels.length === 0
      ? copy.allLabels
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2}`

  function toggleLabel(label: string) {
    const labelKey = label.toLocaleLowerCase(locale)

    setSelectedLabels((currentLabels) =>
      currentLabels.some((currentLabel) => currentLabel.toLocaleLowerCase(locale) === labelKey)
        ? currentLabels.filter(
            (currentLabel) => currentLabel.toLocaleLowerCase(locale) !== labelKey
          )
        : [...currentLabels, label]
    )
  }

  function dismissWithEscape(event: KeyboardEvent<HTMLDetailsElement>) {
    if (event.key !== "Escape" || !event.currentTarget.open) return
    event.preventDefault()
    event.currentTarget.open = false
    event.currentTarget.querySelector("summary")?.focus()
  }

  return (
    <>
      <section
        className="projects-filter"
        aria-label={copy.filterHeading}
        style={{ visibility: isReady ? "visible" : "hidden" }}
      >
        <p className="projects-filter-label">{copy.filterHeading}</p>

        <details
          ref={dropdownRef}
          className="projects-label-dropdown"
          onKeyDown={dismissWithEscape}
        >
          <summary
            className="projects-label-dropdown-trigger"
            aria-label={`${copy.filterHeading}: ${selectedLabelSummary}`}
          >
            <span className="projects-label-dropdown-summary">{selectedLabelSummary}</span>
            {selectedLabels.length > 0 ? (
              <span className="projects-label-dropdown-count">{selectedLabels.length}</span>
            ) : null}
            <svg
              className="projects-label-dropdown-caret"
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </summary>

          <div className="projects-label-dropdown-menu">
            <div className="projects-label-dropdown-actions">
              <span>{copy.allLabels}</span>
              <button
                className="projects-label-clear"
                type="button"
                aria-disabled={selectedLabels.length === 0}
                onClick={() => setSelectedLabels([])}
              >
                {copy.clearLabels}
              </button>
            </div>

            <div className="projects-label-options">
              {availableLabels.map((label, index) => {
                const labelKey = label.toLocaleLowerCase(locale)
                const isChecked = selectedLabelKeys.has(labelKey)
                const inputId = `projects-label-filter-${index}`

                return (
                  <label
                    key={label}
                    className={`projects-label-option${isChecked ? " projects-label-option-active" : ""}`}
                    htmlFor={inputId}
                  >
                    <input
                      id={inputId}
                      className="projects-label-checkbox"
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleLabel(label)}
                    />
                    <span className="projects-label-checkmark" aria-hidden="true" />
                    <span className="projects-label-option-text">{label}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </details>
        <p className="projects-filter-status" role="status" aria-live="polite" aria-atomic="true">
          {copy.resultsCount
            .replace("{count}", String(filteredProjects.length))
            .replace("{total}", String(projects.length))}
        </p>
      </section>

      {filteredProjects.length > 0 ? (
        <Grid projects>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              cardImage={project.cardImage}
              locale={locale}
              readMoreLabel={readMoreLabel}
              readMoreAboutPrefix={readMoreAboutPrefix}
              detailsUnavailableLabel={detailsUnavailableLabel}
              typeLabel={typeLabels[project.type]}
              stageLabel={stageLabels[project.stage]}
              headingLevel={2}
            />
          ))}
        </Grid>
      ) : (
        <MutedText>{copy.noResultsDescription}</MutedText>
      )}
    </>
  )
}

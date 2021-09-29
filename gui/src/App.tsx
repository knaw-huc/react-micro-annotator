import {useEffect, useState} from 'react'

import Search from './components/Search'
import ImageParts from './components/ImageParts'
import AnnotatableText from './components/AnnotatableText'
import Annotator from './components/Annotator'
import {AnnRange} from "./model/AnnRange";
import {Annotation, toAnnotation} from "./model/Annotation";
import Elucidate from "./resources/Elucidate";
import {ElucidateTargetType, SelectorTarget} from "./model/ElucidateAnnotation";
import TextRepo from "./resources/TextRepo";
import Config from "./Config";

export default function App() {

  const [error, setError] = useState<string>()
  const [regionLinks, setRegionLinks] = useState([] as string[])
  const [annotatableText, setAnnotatableText] = useState([] as string[])
  const [selectionRange, setSelectionRange] = useState<AnnRange>()
  const [myAnnotations, setMyAnnotations] = useState<Annotation[]>([])
  const [beginOffsetInResource, setBeginOffsetInResource] = useState(0)
  const [versionId, setVersionId] = useState<string>()
  const [currentCreator, setCurrentCreator] = useState<string>(Config.CREATOR)

  useEffect(() => {
    const getResources = async () => {
      if (!(versionId && currentCreator)) {
        return;
      }
      const foundByCreatorAndVersion = (await Elucidate
        .getAllFilteredBy(versionId, ea => ea.creator === currentCreator))
        .map(toAnnotation);
      setMyAnnotations(foundByCreatorAndVersion);
    }
    getResources()
  }, [versionId, currentCreator]);

  const searchAnnotation = async (annotation: any) => {
    let elAnn = await Elucidate.getByBodyId(annotation.id);
    if (!elAnn) {
      setError('No elucidate annotation found');
      return;
    }
    if (typeof elAnn.target === 'string') {
      setError('Could not find img and txt targets in annotation: ' + JSON.stringify(annotation));
      return;
    }
    const target: ElucidateTargetType[] = elAnn.target;
    setRegionLinks(target
      .filter(t => !t.selector && t.type === 'Image')
      .map(t => t.source));


    let resourceTarget = elAnn.target.find(t => t.type === undefined) as SelectorTarget;
    let resourceId = resourceTarget?.source?.match(/.*(find\/)(.*)(\/contents)/)?.[2];
    if (!resourceId) {
      setError('No resource ID found in ' + JSON.stringify(resourceTarget));
      return;
    }

    // Get text by version uuid (first uuid in ann id):
    const foundVersionId = elAnn.id.match(/.*\/w3c\/([0-9a-f-]{36})\/([0-9a-f-]{36})/)?.[1] as string;
    if (!foundVersionId) {
      setError('No version ID found in ' + elAnn.id);
      return;
    }

    const grid: string[] = await TextRepo.getByVersionIdAndRange(
      foundVersionId, resourceTarget.selector.start, resourceTarget.selector.end
    );

    setVersionId(foundVersionId);
    setBeginOffsetInResource(resourceTarget.selector.start)
    setAnnotatableText(grid)
  }

  const readSelection = (range: AnnRange) => {
    setSelectionRange(range);
  }

  const onAddAnnotation = async (ann: Annotation) => {
    if (!versionId) {
      setError('Cannot save annotation when version id is not set')
      return;
    }

    ann.begin_anchor += beginOffsetInResource;
    ann.end_anchor += beginOffsetInResource;

    const created = await Elucidate.createAnnotation(versionId, ann)
    setSelectionRange(undefined);
    setMyAnnotations([...myAnnotations, created]);
    setCurrentCreator(created.creator);
  }

  const setSelectedAnnotation = async (selectedAnn: number) => {
    setMyAnnotations(myAnnotations.map((annot: Annotation, index: number) => {
      return {...annot, selected: index === selectedAnn};
    }));
  }

  return (
    <div className="container">
      {error ? <p style={{color: "red"}}>ERROR: {error}</p> : null}
      <Search onSearch={searchAnnotation}/>
      <div className='row'>
        <ImageParts images={regionLinks}/>
        {annotatableText.length
          ?
          <>
            <AnnotatableText text={annotatableText} onReadSelection={readSelection}/>
            <Annotator
              currentCreator={currentCreator}
              selectionRange={selectionRange}
              onAddAnnotation={onAddAnnotation}
              onSelectAnnotation={setSelectedAnnotation}
              myAnnotations={myAnnotations}
            />
          </>
          : <>Click search to find an annotation by its ID</>}
      </div>
    </div>
  );
}

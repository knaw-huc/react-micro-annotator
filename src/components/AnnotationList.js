import AnnotationSnippet from './AnnotationSnippet'

export default function AnnotationList({myAnnotations, onSelectAnnotation}) {
    return (
        <div>
            {myAnnotations.map((annotation, index) => (
                <AnnotationSnippet key={index} annot_id={index} annotation={annotation}
                                   onSelectAnnotation={onSelectAnnotation}/>
            ))}
        </div>
    )
}

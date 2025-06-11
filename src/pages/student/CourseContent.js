import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup, Nav, Button, Spinner } from 'react-bootstrap';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';

const CourseContent = () => {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (courseSnap.exists()) {
          setCourse({
            id: courseSnap.id,
            ...courseSnap.data()
          });
        } else {
          setError("Course not found!");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Failed to load course content. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseContent();
    }
  }, [courseId]);

  const handleModuleChange = (moduleIndex) => {
    setCurrentModule(moduleIndex);
    setCurrentLesson(0); // Reset to first lesson when changing modules
  };

  const handleLessonChange = (lessonIndex) => {
    setCurrentLesson(lessonIndex);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Card className="text-center">
          <Card.Body>
            <Card.Title className="text-danger">Error</Card.Title>
            <Card.Text>{error}</Card.Text>
            <Button variant="primary" onClick={() => navigate('/student/courses')}>
              Back to Courses
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (!course || !course.modules || course.modules.length === 0) {
    return (
      <Container className="mt-4">
        <Card className="text-center">
          <Card.Body>
            <Card.Title>No Content Available</Card.Title>
            <Card.Text>This course doesn't have any content yet.</Card.Text>
            <Button variant="primary" onClick={() => navigate('/student/courses')}>
              Back to Courses
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const currentModuleContent = course.modules[currentModule];
  const currentLessonContent = currentModuleContent?.lessons?.[currentLesson] || null;

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md={3}>
          <Card>
            <Card.Header as="h5">Course Content</Card.Header>
            <ListGroup variant="flush">
              {course.modules.map((module, moduleIndex) => (
                <ListGroup.Item key={moduleIndex} className="p-0">
                  <Button 
                    onClick={() => handleModuleChange(moduleIndex)}
                    variant={currentModule === moduleIndex ? "primary" : "light"}
                    className="w-100 text-start d-flex justify-content-between align-items-center p-3"
                  >
                    <span>{module.title}</span>
                    {currentModule === moduleIndex && <i className="bi bi-chevron-down"></i>}
                    {currentModule !== moduleIndex && <i className="bi bi-chevron-right"></i>}
                  </Button>
                  
                  {currentModule === moduleIndex && module.lessons && (
                    <ListGroup variant="flush">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <ListGroup.Item 
                          key={lessonIndex} 
                          action 
                          active={currentLesson === lessonIndex}
                          onClick={() => handleLessonChange(lessonIndex)}
                          className="ps-4"
                        >
                          {lesson.title}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        <Col md={9}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h3>{currentLessonContent?.title || "Lesson Content"}</h3>
              <div>
                {currentLesson > 0 && (
                  <Button 
                    variant="outline-primary" 
                    className="me-2"
                    onClick={() => handleLessonChange(currentLesson - 1)}
                  >
                    Previous
                  </Button>
                )}
                {currentLessonContent && currentLesson < currentModuleContent.lessons.length - 1 && (
                  <Button 
                    variant="primary"
                    onClick={() => handleLessonChange(currentLesson + 1)}
                  >
                    Next
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {currentLessonContent ? (
                <div className="lesson-content">
                  <div dangerouslySetInnerHTML={{ __html: currentLessonContent.content }} />
                  
                  {currentLessonContent.videoUrl && (
                    <div className="mt-4">
                      <h5>Lesson Video</h5>
                      <div className="ratio ratio-16x9">
                        <iframe
                          src={currentLessonContent.videoUrl}
                          title="Lesson Video"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                  
                  {currentLessonContent.resources && currentLessonContent.resources.length > 0 && (
                    <div className="mt-4">
                      <h5>Resources</h5>
                      <ListGroup>
                        {currentLessonContent.resources.map((resource, idx) => (
                          <ListGroup.Item key={idx}>
                            <a href={resource.url} target="_blank" rel="noreferrer">
                              {resource.title || `Resource ${idx + 1}`}
                            </a>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-5">
                  <p>Select a lesson to start learning</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseContent;

import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import moment from "moment"

const Question = ({ question }) => {
    const { t } = useTranslation()
    
    return (
        <div className="display-question-container">
            <div className="display-votes-ans">
                <p>{question.upvote.length - question.downvote.length}</p>
                <p>{t('questions.votes')}</p>
            </div>
            <div className="display-votes-ans">
                <p>{question.noofanswers}</p>
                <p>{t('questions.answers')}</p>
            </div>
            <div className="display-question-details">
                <Link to={`/Question/${question._id}`} className='question-title-link'>
                    {question.questiontitle.length > (window.innerWidth <= 400 ? 70 : 90)
                        ? question.questiontitle.substring(
                            0,
                            window.innerWidth <= 400 ? 70 : 90
                        ) + "..."
                        : question.questiontitle
                    }
                    {question.hasVideo && <span className="video-indicator">🎥 {t('questions.uploadVideo')}</span>}
                </Link>
                {question.hasVideo && question.video && (
                    <div className="video-preview" style={{marginTop: '10px'}}>
                        <video 
                            width="200" 
                            height="120" 
                            controls 
                            style={{borderRadius: '4px', border: '1px solid #ddd'}}
                        >
                            <source src={`http://localhost:5001${question.video}`} type="video/mp4" />
                            {t('questions.selectVideo')}
                        </video>
                    </div>
                )}
                <div className="display-tags-time">
                    <div className="display-tags">
                        {question.questiontags.map((tag)=>(
                            <p key={tag}> {tag}</p>
                        ))}
                    </div>
                    <p className="display-time">
                        {t('questions.asked')} {moment(question.askedon).fromNow()} {question.userposted}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Question

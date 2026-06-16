import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface AnalysisResultAttributes {
  id: number;
  userId: number;
  imageType: 'xray' | 'ct';
  imagePath: string;
  originalFilename: string;
  gateClassification: 'Chest_XRay' | 'Chest_CT' | 'Other_Medical' | 'Non_Medical' | null;
  gateConfidence: number | null;
  classification: string;
  clinicalGroup: string | null;
  confidence: number;
  hasFindings: boolean;
  hasCancer: boolean | null;
  cancerProbability: number | null;
  isMalignant: boolean | null;
  allProbabilities: Record<string, number>;
  tbDetected: boolean | null;
  tbConfidence: number | null;
  noduleBoundingBox: Record<string, number> | null;
  noduleSizeMm: number | null;
  noduleDetectionConfidence: number | null;
  nextStep: string | null;
  sessionId: string | null;
  status: 'pending' | 'completed' | 'failed';
  processingTimeMs: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AnalysisResultCreationAttributes
  extends Optional<
    AnalysisResultAttributes,
    | 'id'
    | 'hasCancer'
    | 'cancerProbability'
    | 'isMalignant'
    | 'gateClassification'
    | 'gateConfidence'
    | 'clinicalGroup'
    | 'tbDetected'
    | 'tbConfidence'
    | 'noduleBoundingBox'
    | 'noduleSizeMm'
    | 'noduleDetectionConfidence'
    | 'nextStep'
    | 'sessionId'
    | 'processingTimeMs'
    | 'status'
  > { }

class AnalysisResult
  extends Model<AnalysisResultAttributes, AnalysisResultCreationAttributes>
  implements AnalysisResultAttributes {
  public id!: number;
  public userId!: number;
  public imageType!: 'xray' | 'ct';
  public imagePath!: string;
  public originalFilename!: string;
  public gateClassification!: 'Chest_XRay' | 'Chest_CT' | 'Other_Medical' | 'Non_Medical' | null;
  public gateConfidence!: number | null;
  public classification!: string;
  public clinicalGroup!: string | null;
  public confidence!: number;
  public hasFindings!: boolean;
  public hasCancer!: boolean | null;
  public cancerProbability!: number | null;
  public isMalignant!: boolean | null;
  public allProbabilities!: Record<string, number>;
  public tbDetected!: boolean | null;
  public tbConfidence!: number | null;
  public noduleBoundingBox!: Record<string, number> | null;
  public noduleSizeMm!: number | null;
  public noduleDetectionConfidence!: number | null;
  public nextStep!: string | null;
  public sessionId!: string | null;
  public status!: 'pending' | 'completed' | 'failed';
  public processingTimeMs!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AnalysisResult.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    imageType: { type: DataTypes.ENUM('xray', 'ct'), allowNull: false },
    imagePath: { type: DataTypes.STRING(500), allowNull: false },
    originalFilename: { type: DataTypes.STRING(255), allowNull: false },
    gateClassification: { type: DataTypes.STRING(50), allowNull: true },
    gateConfidence: { type: DataTypes.DECIMAL(5, 4), allowNull: true },
    classification: { type: DataTypes.STRING(100), allowNull: false },
    clinicalGroup: { type: DataTypes.STRING(100), allowNull: true },
    confidence: { type: DataTypes.DECIMAL(5, 4), allowNull: false },
    hasFindings: { type: DataTypes.BOOLEAN, allowNull: false },
    hasCancer: { type: DataTypes.BOOLEAN, allowNull: true },
    cancerProbability: { type: DataTypes.DECIMAL(5, 4), allowNull: true },
    isMalignant: { type: DataTypes.BOOLEAN, allowNull: true },
    allProbabilities: { type: DataTypes.JSON, allowNull: false },
    tbDetected: { type: DataTypes.BOOLEAN, allowNull: true },
    tbConfidence: { type: DataTypes.DECIMAL(5, 4), allowNull: true },
    noduleBoundingBox: { type: DataTypes.JSON, allowNull: true },
    noduleSizeMm: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
    noduleDetectionConfidence: { type: DataTypes.DECIMAL(5, 4), allowNull: true },
    nextStep: { type: DataTypes.TEXT, allowNull: true },
    sessionId: { type: DataTypes.STRING(100), allowNull: true },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    processingTimeMs: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    tableName: 'analysis_results',
    underscored: true,
  }
);

AnalysisResult.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AnalysisResult, { foreignKey: 'userId', as: 'analyses' });

export default AnalysisResult;
